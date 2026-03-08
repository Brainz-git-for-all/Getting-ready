package sprint.Pac.Reminder;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    public Reminder createReminder(Long userId, Reminder reminder) {
        reminder.setUserId(userId); // Explicitly link to the user
        return reminderRepository.save(reminder);
    }

    public List<Reminder> getRemindersByUserId(Long userId) {
        return reminderRepository.findByUserId(userId);
    }

    public Optional<Reminder> getReminderByIdAndUserId(UUID id, Long userId) {
        return reminderRepository.findByIdAndUserId(id, userId);
    }

    public Reminder updateReminder(UUID id, Long userId, Reminder updatedReminder) {
        return reminderRepository.findByIdAndUserId(id, userId).map(existingReminder -> {
            existingReminder.setName(updatedReminder.getName());
            existingReminder.setRemindAt(updatedReminder.getRemindAt());
            existingReminder.setDeadline(updatedReminder.getDeadline());
            // userId remains unchanged
            return reminderRepository.save(existingReminder);
        }).orElseThrow(() -> new RuntimeException("Reminder not found or does not belong to user"));
    }

    public void deleteReminder(UUID id, Long userId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Reminder not found or does not belong to user"));
        reminderRepository.delete(reminder);
    }
}