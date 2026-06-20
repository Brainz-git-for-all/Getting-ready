package sprint.Pac.Ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired private GeminiAiService geminiAiService;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private QuickTaskRepository quickTaskRepo;
    @Autowired private HabitRepository habitRepo;
    @Autowired private ScheduleBlockRepository scheduleBlockRepo;
    @Autowired private SprintRepository sprintRepository;
    @Autowired private ActivityCategoryRepository categoryRepository;

    @PostMapping("/onboarding")
    public ResponseEntity<?> saveAiProfile(@RequestBody AiProfileRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow();
        user.setAiProfile(request.getProfileData());
        userRepository.save(user);
        return ResponseEntity.ok("Profile saved successfully.");
    }

    // 0. NEW: Endpoint to get daily tips
    @GetMapping("/tips/{userId}")
    public ResponseEntity<String> getDailyTips(@PathVariable Long userId) {
        return ResponseEntity.ok(geminiAiService.generateDailyTips(userId));
    }

    @GetMapping("/habit-insights/{userId}")
    public ResponseEntity<String> getHabitInsights(@PathVariable Long userId) {
        return ResponseEntity.ok(geminiAiService.generateHabitInsights(userId));
    }
    @PostMapping("/chat")
    public ResponseEntity<String> chatWithAi(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(geminiAiService.generateAiResponse(request.getUserId(), request.getHistory()));
    }

    @PostMapping("/accept-proposal")
    public ResponseEntity<?> acceptProposal(@RequestBody AiProposalAcceptRequest request) {
        System.out.println("===============================================");
        System.out.println("🚀 AI PROPOSAL ARRIVED IN JAVA! User ID: " + request.getUserId());

        LocalDate today = LocalDate.now();
        Sprint targetSprint = null;
        boolean hasSprintTasks = request.getTasks() != null && !request.getTasks().isEmpty();

        // 1. SPRINT
        if (request.getSprintId() != null && request.getSprintId() > 0) {
            targetSprint = sprintRepository.findById(request.getSprintId()).orElse(null);
            System.out.println("📌 Using existing Sprint ID: " + request.getSprintId());
        } else if (hasSprintTasks || (request.getSprintName() != null && !request.getSprintName().isEmpty())) {
            String safeSprintName = (request.getSprintName() != null && !request.getSprintName().isEmpty()) ? request.getSprintName() : "AI Generated Sprint";
            int safeDuration = request.getDurationDays() > 0 ? request.getDurationDays() : 7;
            targetSprint = new Sprint();
            targetSprint.setName("AI: " + safeSprintName);
            targetSprint.setStartDate(today);
            targetSprint.setEndDate(today.plusDays(safeDuration));
            targetSprint.setUserId(request.getUserId());
            targetSprint = sprintRepository.save(targetSprint);
            System.out.println("✅ SAVED NEW SPRINT: " + targetSprint.getName());
        }

        // 2. SPRINT TASKS
        if (hasSprintTasks) {
            for (AiTaskDto t : request.getTasks()) {
                try {
                    Task task = new Task();
                    task.setName(t.getName() != null ? t.getName() : "Unnamed Task");
                    task.setDescription(t.getDescription());
                    task.setPriority(t.getPriority() != null ? t.getPriority() : "Medium");
                    task.setStartDate(today);
                    task.setEndDate(t.getEndDate() != null ? t.getEndDate() : (targetSprint != null ? targetSprint.getEndDate() : today.plusDays(7)));

                    if (t.getSprintId() != null && t.getSprintId() > 0) {
                        task.setSprint(sprintRepository.findById(t.getSprintId()).orElse(targetSprint));
                    } else {
                        task.setSprint(targetSprint);
                    }
                    task.setCategory(resolveCategory(t.getCategoryId(), t.getCategoryName(), request.getUserId()));
                    task.setCompleted(false);
                    task.setReminderSent(false);

                    if(task.getSprint() != null) {
                        taskRepository.save(task);
                        System.out.println("✅ SAVED SPRINT TASK: " + task.getName());
                    }
                } catch(Exception e) {
                    System.err.println("❌ MYSQL ERROR SAVING TASK: ");
                    e.printStackTrace();
                }
            }
        }

        // 3. QUICK TASKS
        if (request.getQuickTasks() != null && !request.getQuickTasks().isEmpty()) {
            for (AiQuickTaskDto qt : request.getQuickTasks()) {
                try {
                    QuickTask quickTask = new QuickTask();
                    quickTask.setName(qt.getName());
                    quickTask.setDescription(qt.getDescription());
                    quickTask.setPriority(qt.getPriority() != null ? qt.getPriority() : "Medium");
                    quickTask.setStartDate(today);
                    quickTask.setEndDate(today.plusDays(Math.max(qt.getDurationDays(), 1)));
                    quickTask.setUserId(request.getUserId());
                    quickTask.setCompleted(false);
                    quickTask.setReminderSent(false);
                    quickTask.setCategory(resolveCategory(qt.getCategoryId(), qt.getCategoryName(), request.getUserId()));

                    quickTaskRepo.save(quickTask);
                    System.out.println("✅ SAVED QUICK TASK: " + quickTask.getName());
                } catch(Exception e) {
                    System.err.println("❌ MYSQL ERROR SAVING QUICK TASK: ");
                    e.printStackTrace();
                }
            }
        }

        // 4. HABITS
        if (request.getHabits() != null && !request.getHabits().isEmpty()) {
            for (AiHabitDto h : request.getHabits()) {
                try {
                    Habit habit = new Habit();
                    habit.setName(h.getName());
                    habit.setBadHabit(h.isBadHabit());
                    habit.setUserId(request.getUserId());
                    habit.setCategory(resolveCategory(h.getCategoryId(), h.getCategoryName(), request.getUserId()));

                    if (h.getRemindTime() != null && !h.getRemindTime().isEmpty()) {
                        habit.setRemindEnabled(true);
                        habit.setRemindTime(LocalTime.parse(h.getRemindTime()));
                    } else { habit.setRemindEnabled(false); }

                    habitRepo.save(habit);
                    System.out.println("✅ SAVED HABIT: " + habit.getName());
                } catch(Exception e) {
                    System.err.println("❌ MYSQL ERROR SAVING HABIT: ");
                    e.printStackTrace();
                }
            }
        }

        // 5. SCHEDULE BLOCKS
        if (request.getScheduleBlocks() != null && !request.getScheduleBlocks().isEmpty()) {
            for (AiScheduleBlockDto b : request.getScheduleBlocks()) {
                try {
                    ScheduleBlock block = new ScheduleBlock();
                    block.setDay(DayOfWeek.valueOf(b.getDay().toUpperCase()));
                    block.setStartTime(LocalTime.parse(b.getStartTime()));
                    block.setEndTime(LocalTime.parse(b.getEndTime()));
                    block.setRemindEnabled(true);
                    block.setRemindOffsetMinutes(15);
                    block.setUser(userRepository.findById(request.getUserId()).orElseThrow());
                    block.setCategory(resolveCategory(b.getCategoryId(), b.getCategoryName(), request.getUserId()));

                    scheduleBlockRepo.save(block);
                    System.out.println("✅ SAVED SCHEDULE BLOCK: " + block.getDay());
                } catch (Exception e) {
                    System.err.println("❌ MYSQL ERROR SAVING SCHEDULE BLOCK: ");
                    e.printStackTrace();
                }
            }
        }

        System.out.println("===============================================");
        return ResponseEntity.ok("AI Proposal saved!");
    }

    private ActivityCategory resolveCategory(Long categoryId, String categoryName, Long userId) {
        if (categoryId != null && categoryId > 0) {
            return categoryRepository.findById(categoryId).orElse(null);
        }
        if (categoryName != null && !categoryName.isEmpty()) {
            return getOrCreateCategory(categoryName, userId);
        }
        return null;
    }

    private ActivityCategory getOrCreateCategory(String name, Long userId) {
        List<ActivityCategory> allCats = categoryRepository.findAll();
        for (ActivityCategory c : allCats) {
            if (c.getName().equalsIgnoreCase(name) && c.getUserId() != null && c.getUserId().equals(userId)) return c;
        }
        ActivityCategory newCat = new ActivityCategory();
        newCat.setName(name);
        newCat.setColor("#4f46e5");
        newCat.setUserId(userId);
        return categoryRepository.save(newCat);
    }
}