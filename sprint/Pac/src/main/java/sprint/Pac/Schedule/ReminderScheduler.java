package sprint.Pac.Schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sprint.Pac.Jwt.User;
import sprint.Pac.Jwt.UserRepository;
import sprint.Pac.QuickTask.QuickTask;
import sprint.Pac.QuickTask.QuickTaskRepository;
import sprint.Pac.Sprint.Task;
import sprint.Pac.Sprint.TaskRepository;
import sprint.Pac.DailyMostDo.Habit;
import sprint.Pac.DailyMostDo.HabitRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@EnableScheduling
public class ReminderScheduler {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SmsService smsService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private QuickTaskRepository quickTaskRepo;

    @Autowired
    private TaskRepository taskRepo;

    @Autowired
    private HabitRepository habitRepo;

    @Autowired
    private ScheduleBlockRepository scheduleBlockRepo;

    @Autowired
    private UserRepository userRepo;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkAndSendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDateTime startWindow = now.minusMinutes(2);
        LocalDateTime endWindow = now.plusMinutes(1);

        System.out.println("⏰ Checking All Reminders at " + now);

        // ==========================================
        // 1. PROCESS QUICK TASKS
        // ==========================================
        List<QuickTask> pendingQuickTasks = quickTaskRepo.findByRemindAtBetweenAndCompletedFalseAndReminderSentFalse(startWindow, endWindow);
        for (QuickTask qt : pendingQuickTasks) {
            userRepo.findById(qt.getUserId()).ifPresent(user -> {
                String message = "⚡ SprintApp: Quick Task '" + qt.getName() + "' is due!";
                sendLiveAlertToUser(user.getId(), message);
                sendEmail(user.getEmail(), "Task Due Alert", message);
                smsService.sendSms(user.getPhoneNumber(), message);
            });
            qt.setReminderSent(true);
            quickTaskRepo.save(qt);
        }

        // ==========================================
        // 2. PROCESS SPRINT TASKS
        // ==========================================
        List<Task> pendingSprintTasks = taskRepo.findByRemindAtBetweenAndCompletedFalseAndReminderSentFalse(startWindow, endWindow);
        for (Task task : pendingSprintTasks) {
            Long userId = task.getSprint().getUserId();
            userRepo.findById(userId).ifPresent(user -> {
                String message = "📋 SprintApp: Sprint Task '" + task.getName() + "' is due!";
                sendLiveAlertToUser(user.getId(), message);
                sendEmail(user.getEmail(), "Task Due Alert", message);
                smsService.sendSms(user.getPhoneNumber(), message);
            });
            task.setReminderSent(true);
            taskRepo.save(task);
        }

        // ==========================================
        // 3. PROCESS HABITS (Daily)
        // ==========================================
        List<Habit> activeHabits = habitRepo.findByRemindEnabledTrue();
        for (Habit habit : activeHabits) {
            if (habit.getRemindTime() != null) {
                // If it is the exact hour and minute
                if (habit.getRemindTime().getHour() == now.getHour() && habit.getRemindTime().getMinute() == now.getMinute()) {
                    // Make sure we haven't already reminded them TODAY
                    if (habit.getLastRemindedDate() == null || !habit.getLastRemindedDate().equals(today)) {
                        userRepo.findById(habit.getUserId()).ifPresent(user -> {
                            String msg = "🔄 SprintApp: Time for your habit - " + habit.getName();
                            sendLiveAlertToUser(user.getId(), msg);
                            sendEmail(user.getEmail(), "Habit Reminder", msg);
                            smsService.sendSms(user.getPhoneNumber(), msg);
                        });
                        habit.setLastRemindedDate(today);
                        habitRepo.save(habit);
                    }
                }
            }
        }

        // ==========================================
        // 4. PROCESS SCHEDULE BLOCKS
        // ==========================================
        DayOfWeek todayDayOfWeek = now.getDayOfWeek();
        List<ScheduleBlock> todaysBlocks = scheduleBlockRepo.findByDayAndRemindEnabledTrue(todayDayOfWeek);

        for (ScheduleBlock block : todaysBlocks) {
            if (block.getStartTime() != null) {
                // Do the math: Subtract the offset from the start time
                int offset = block.getRemindOffsetMinutes() != null ? block.getRemindOffsetMinutes() : 15;
                LocalTime targetTime = block.getStartTime().minusMinutes(offset);

                // If right now matches the target time
                if (targetTime.getHour() == now.getHour() && targetTime.getMinute() == now.getMinute()) {
                    // Make sure we haven't reminded them today
                    if (block.getLastRemindedDate() == null || !block.getLastRemindedDate().equals(today)) {
                        String catName = block.getCategory() != null ? block.getCategory().getName() : "Scheduled Activity";
                        String msg = "📅 SprintApp: '" + catName + "' starts in " + offset + " minutes!";

                        sendLiveAlertToUser(block.getUser().getId(), msg);
                        sendEmail(block.getUser().getEmail(), "Schedule Reminder", msg);
                        smsService.sendSms(block.getUser().getPhoneNumber(), msg);

                        block.setLastRemindedDate(today);
                        scheduleBlockRepo.save(block);
                    }
                }
            }
        }
    }

    private void sendLiveAlertToUser(Long userId, String message) {
        messagingTemplate.convertAndSend("/queue/alerts-" + userId, message);
        System.out.println("🌐 Sent Live Web Browser alert to user: " + userId);
    }

    private void sendEmail(String toEmail, String subject, String text) {
        if (toEmail == null || toEmail.trim().isEmpty()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@sprintapp.com");
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("📧 Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }
}