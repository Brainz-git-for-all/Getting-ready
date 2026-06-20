package sprint.Pac.Ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sprint.Pac.Activity.ActivityCategory;
import sprint.Pac.Activity.ActivityCategoryRepository;
import sprint.Pac.DailyMostDo.Habit;
import sprint.Pac.DailyMostDo.HabitRepository;
import sprint.Pac.Jwt.User;
import sprint.Pac.Jwt.UserRepository;
import sprint.Pac.QuickTask.QuickTask;
import sprint.Pac.QuickTask.QuickTaskRepository;
import sprint.Pac.Schedule.ScheduleBlock;
import sprint.Pac.Schedule.ScheduleBlockRepository;
import sprint.Pac.Sprint.Sprint;
import sprint.Pac.Sprint.SprintRepository;
import sprint.Pac.Sprint.Task;
import sprint.Pac.Sprint.TaskRepository;

import sprint.Pac.DailyMostDo.DailySession;
import sprint.Pac.DailyMostDo.DailySessionRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    @Value("${github.ai.key}")
    private String apiKey;

    @Value("${github.ai.url}")
    private String apiUrl;

    @Autowired private UserRepository userRepository;
    @Autowired private ActivityCategoryRepository categoryRepository;
    @Autowired private SprintRepository sprintRepository;
    @Autowired private ScheduleBlockRepository scheduleBlockRepo;
    @Autowired private TaskRepository taskRepository;
    @Autowired private QuickTaskRepository quickTaskRepo;
    @Autowired private HabitRepository habitRepo;
    @Autowired private DailySessionRepository sessionRepository;

    // --- 1. THE CHATBOT ENGINE ---
    public String generateAiResponse(Long userId, List<AiChatRequest.ChatMessage> history) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found: " + userId));
        String userProfile = user.getAiProfile() != null ? user.getAiProfile() : "No weaknesses recorded.";

        String catList = categoryRepository.findAll().stream().filter(c -> c.getUserId() != null && c.getUserId().equals(userId)).map(c -> "[ID: " + c.getId() + ", Name: '" + c.getName() + "']").collect(Collectors.joining(", "));
        String sprintList = sprintRepository.findAll().stream().filter(s -> s.getUserId() != null && s.getUserId().equals(userId)).map(s -> "[ID: " + s.getId() + ", Name: '" + s.getName() + "']").collect(Collectors.joining(", "));
        String scheduleList = scheduleBlockRepo.findAll().stream().filter(b -> b.getUser() != null && b.getUser().getId().equals(userId)).map(b -> "[" + b.getDay() + " " + b.getStartTime() + "-" + b.getEndTime() + " (" + (b.getCategory() != null ? b.getCategory().getName() : "No Cat") + ")]").collect(Collectors.joining(", "));

        String systemInstruction = "You are SprintBot, an elite productivity Consultant AI.\n" +
                "User Profile: [" + userProfile + "].\n" +
                "User's EXISTING Categories: " + (catList.isEmpty() ? "None" : catList) + ".\n" +
                "User's EXISTING Sprints: " + (sprintList.isEmpty() ? "None" : sprintList) + ".\n" +
                "User's EXISTING Schedule: " + (scheduleList.isEmpty() ? "None" : scheduleList) + ".\n\n" +
                "CONSULTANT RULES:\n" +
                "1. NEVER generate a PROPOSAL on the first message. You must ALWAYS ask for clarification via CHAT first.\n" +
                "2. If the user asks for a task/habit/sprint, check EXISTING Categories/Schedule.\n" +
                "   - If match exists: ask to link it.\n" +
                "   - If no match exists: ask to create a new one or keep it standalone.\n" +
                "3. Wait for the user's decision before generating a PROPOSAL.\n" +
                "4. ONLY generate data the user asked for. Use empty arrays for things they didn't ask for.\n\n" +
                "CRITICAL: DO NOT INCLUDE ANY CONVERSATIONAL TEXT BEFORE OR AFTER THE JSON. OUTPUT ONLY THE JSON OBJECT. NO MARKDOWN.\n\n" +
                "Format for CHAT:\n{ \"type\": \"CHAT\", \"message\": \"Your question here.\" }\n\n" +
                "Format for PROPOSAL:\n{ \n  \"type\": \"PROPOSAL\", \n  \"message\": \"Plan ready! Click Accept to save.\", \n  \"proposal\": { \n    \"sprintId\": null, \"sprintName\": null, \"durationDays\": 0, \n    \"tasks\": [], \n    \"quickTasks\": [ { \"name\": \"Pay Bill\", \"description\": \"Electric\", \"priority\": \"Medium\", \"durationDays\": 1, \"categoryId\": null, \"categoryName\": null } ], \n    \"habits\": [], \n    \"scheduleBlocks\": [] \n  } \n}";

        return callChatGPT(systemInstruction, history);
    }

    // --- 2. THE NEW TIPS ENGINE (NOW 100% NULL-SAFE) ---
    public String generateDailyTips(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String userProfile = user.getAiProfile() != null ? user.getAiProfile() : "No goals/weaknesses recorded. Suggest they fill out their profile.";

        // NULL-SAFE TASK FETCHING
        String pendingTasks = taskRepository.findAll().stream()
                .filter(t -> t.getSprint() != null && t.getSprint().getUserId() != null && t.getSprint().getUserId().equals(userId))
                .filter(t -> t.getCompleted() == null || !t.getCompleted())
                .map(t -> t.getName() + " (" + (t.getPriority() != null ? t.getPriority() : "Medium") + ")")
                .collect(Collectors.joining(", "));

        // NULL-SAFE QUICK TASK FETCHING
        String pendingQuickTasks = quickTaskRepo.findAll().stream()
                .filter(qt -> qt.getUserId() != null && qt.getUserId().equals(userId))
                .filter(qt -> qt.getCompleted() == null || !qt.getCompleted())
                .map(qt -> qt.getName() + " (" + (qt.getPriority() != null ? qt.getPriority() : "Medium") + ")")
                .collect(Collectors.joining(", "));

        // NULL-SAFE HABIT FETCHING
        String habits = habitRepo.findAll().stream()
                .filter(h -> h.getUserId() != null && h.getUserId().equals(userId))
                .map(h -> h.getName() + (h.getBadHabit() != null && h.getBadHabit() ? " [BAD]" : " [GOOD]"))
                .collect(Collectors.joining(", "));

        // NULL-SAFE SCHEDULE FETCHING
        String scheduleList = scheduleBlockRepo.findAll().stream()
                .filter(b -> b.getUser() != null && b.getUser().getId().equals(userId))
                .map(b -> b.getDay() + " " + b.getStartTime() + "-" + b.getEndTime())
                .collect(Collectors.joining(", "));

        String systemInstruction = "You are an elite AI Productivity Coach. Look at the user's workload and profile below.\n" +
                "User's Goals & Weaknesses: [" + userProfile + "]\n" +
                "Pending Sprint Tasks: [" + pendingTasks + "]\n" +
                "Pending Quick Tasks: [" + pendingQuickTasks + "]\n" +
                "Tracked Habits: [" + habits + "]\n" +
                "Weekly Schedule: [" + scheduleList + "]\n\n" +
                "YOUR MISSION:\n" +
                "Analyze this data to find conflicts, overwhelming workloads, or missing routines. " +
                "Write an inspiring 'Advice of the Day' based on their specific goals, and generate EXACTLY 3 actionable tips analyzing their tasks/schedule.\n\n" +
                "CRITICAL: Output ONLY valid JSON. No markdown. Format EXACTLY like this:\n" +
                "{ \"adviceOfTheDay\": \"Discipline equals freedom. Tackle your hardest task first.\", \"tips\": [ \"Tip 1\", \"Tip 2\", \"Tip 3\" ] }";

        return callChatGPT(systemInstruction, null);
    }

    // --- 3. HABIT INSIGHTS ENGINE ---
    public String generateHabitInsights(Long userId) {
        List<Habit> habits = habitRepo.findAll().stream()
                .filter(h -> h.getUserId() != null && h.getUserId().equals(userId))
                .collect(Collectors.toList());

        if (habits.isEmpty()) {
            return "{ \"overallMessage\": \"You have no habits set up yet. Add some habits to get personalized insights!\", \"insights\": [] }";
        }

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(29);

        List<DailySession> recentSessions = sessionRepository.findAllByUserId(userId).stream()
                .filter(s -> s.getLogDate() != null && !s.getLogDate().isBefore(thirtyDaysAgo))
                .collect(Collectors.toList());

        StringBuilder habitData = new StringBuilder();
        for (Habit h : habits) {
            long daysLogged = recentSessions.stream()
                    .filter(s -> s.getCompletedHabitIds() != null && s.getCompletedHabitIds().contains(h.getId()))
                    .count();
            int pct = (int) Math.round((daysLogged / 30.0) * 100);
            boolean isBad = h.getBadHabit() != null && h.getBadHabit();

            habitData.append("- Habit: \"").append(h.getName()).append("\"");
            habitData.append(" | Type: ").append(isBad ? "BAD HABIT (goal: break it)" : "GOOD HABIT (goal: build it)");
            if (h.getDescription() != null && !h.getDescription().isBlank()) {
                habitData.append(" | User's goal: \"").append(h.getDescription()).append("\"");
            }
            habitData.append(" | Completion last 30 days: ").append(daysLogged).append("/30 days (").append(pct).append("%)");
            habitData.append("\n");
        }

        String systemInstruction = "You are a personal habit coach AI. Below is a user's habit tracking data for the last 30 days.\n\n" +
                "HABIT DATA:\n" + habitData + "\n" +
                "YOUR TASK: Give SPECIFIC, HONEST, PERSONALIZED advice for EACH habit based on the completion percentage.\n" +
                "- GOOD HABIT with low completion (<40%): diagnose why and give 2 concrete strategies to build consistency.\n" +
                "- GOOD HABIT with medium completion (40-70%): acknowledge progress and suggest 1-2 ways to push higher.\n" +
                "- GOOD HABIT with high completion (>70%): celebrate and give a tip to maintain the streak.\n" +
                "- BAD HABIT with high completion (>50%): be direct about the problem and give 2 strategies to reduce/break it.\n" +
                "- BAD HABIT with low completion (<50%): congratulate the progress and reinforce what's working.\n" +
                "Always reference the user's own goal/description in your advice when available. Be direct, not generic.\n\n" +
                "Output ONLY valid JSON, no markdown, in EXACTLY this format:\n" +
                "{ \"overallMessage\": \"One honest sentence summarizing overall habit health.\", " +
                "\"insights\": [ { \"name\": \"Habit name here\", \"daysLogged\": 20, \"totalDays\": 30, \"assessment\": \"On Track\", \"advice\": \"Specific advice here.\" } ] }\n" +
                "Assessment must be one of: On Track, Good Progress, Needs Improvement, Struggling, Breaking Free (for bad habits reducing).";

        return callChatGPT(systemInstruction, null);
    }

    // --- REUSABLE HTTP CALLER ---
    private String callChatGPT(String systemInstruction, List<AiChatRequest.ChatMessage> history) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemInstruction);
        messages.add(systemMsg);

        if (history != null && !history.isEmpty()) {
            for (AiChatRequest.ChatMessage chat : history) {
                Map<String, String> msg = new HashMap<>();
                msg.put("role", chat.getRole());
                msg.put("content", chat.getContent());
                messages.add(msg);
            }
        } else if (history == null) {
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", "Generate my daily analysis and tips.");
            messages.add(userMsg);
        }

        requestBody.put("messages", messages);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map response = restTemplate.postForObject(apiUrl, request, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String rawText = (String) message.get("content");

            String cleaned = rawText.replace("```json", "").replace("```", "").trim();
            int startIndex = cleaned.indexOf("{");
            int endIndex = cleaned.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1) return cleaned.substring(startIndex, endIndex + 1);
            return cleaned;
        } catch (Exception e) {
            e.printStackTrace();
            return "{ \"adviceOfTheDay\": \"Take a deep breath and rest. I am having trouble connecting to my brain right now.\", \"tips\": [\"Check your internet connection.\", \"Ensure my API key is valid.\", \"Check the server logs.\"] }";
        }
    }
}