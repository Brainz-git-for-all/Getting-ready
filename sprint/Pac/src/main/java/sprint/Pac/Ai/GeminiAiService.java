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
import sprint.Pac.Jwt.User;
import sprint.Pac.Jwt.UserRepository;
import sprint.Pac.Schedule.ScheduleBlock;
import sprint.Pac.Schedule.ScheduleBlockRepository;
import sprint.Pac.Sprint.Sprint;
import sprint.Pac.Sprint.SprintRepository;

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

    public String generateAiResponse(Long userId, List<AiChatRequest.ChatMessage> history) {

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found: " + userId));
        String userProfile = user.getAiProfile() != null ? user.getAiProfile() : "No weaknesses recorded.";

        String catList = categoryRepository.findAll().stream()
                .filter(c -> c.getUserId() != null && c.getUserId().equals(userId))
                .map(c -> "[ID: " + c.getId() + ", Name: '" + c.getName() + "']")
                .collect(Collectors.joining(", "));

        String sprintList = sprintRepository.findAll().stream()
                .filter(s -> s.getUserId() != null && s.getUserId().equals(userId))
                .map(s -> "[ID: " + s.getId() + ", Name: '" + s.getName() + "']")
                .collect(Collectors.joining(", "));

        String scheduleList = scheduleBlockRepo.findAll().stream()
                .filter(b -> b.getUser() != null && b.getUser().getId().equals(userId))
                .map(b -> "[" + b.getDay() + " " + b.getStartTime() + "-" + b.getEndTime() + " (" + (b.getCategory() != null ? b.getCategory().getName() : "No Cat") + ")]")
                .collect(Collectors.joining(", "));

        // STRICT INSTRUCTIONS
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
                "Format for CHAT:\n" +
                "{ \"type\": \"CHAT\", \"message\": \"Your question here.\" }\n\n" +
                "Format for PROPOSAL:\n" +
                "{ \n" +
                "  \"type\": \"PROPOSAL\", \n" +
                "  \"message\": \"Plan ready! Click Accept to save.\", \n" +
                "  \"proposal\": { \n" +
                "    \"sprintId\": null, \"sprintName\": null, \"durationDays\": 0, \n" +
                "    \"tasks\": [], \n" +
                "    \"quickTasks\": [ { \"name\": \"Pay Bill\", \"description\": \"Electric\", \"priority\": \"Medium\", \"durationDays\": 1, \"categoryId\": null, \"categoryName\": null } ], \n" +
                "    \"habits\": [], \n" +
                "    \"scheduleBlocks\": [] \n" +
                "  } \n" +
                "}";

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
        }

        requestBody.put("messages", messages);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map response = restTemplate.postForObject(apiUrl, request, Map.class);
            return extractTextFromChatGptResponse(response);
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"type\": \"ERROR\", \"message\": \"Failed to connect to AI.\"}";
        }
    }

    private String extractTextFromChatGptResponse(Map response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String rawText = (String) message.get("content");

            // 1. Clean markdown
            String cleaned = rawText.replace("```json", "").replace("```", "").trim();

            // 2. THE BULLETPROOF FIX: Find the first { and last } to cut out chatty text!
            int startIndex = cleaned.indexOf("{");
            int endIndex = cleaned.lastIndexOf("}");

            if (startIndex != -1 && endIndex != -1) {
                return cleaned.substring(startIndex, endIndex + 1);
            }

            return cleaned;
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"type\": \"ERROR\", \"message\": \"Failed to parse AI response.\"}";
        }
    }
}