package sprint.Pac.Reminder;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(@PathVariable Long userId, @RequestBody Reminder reminder) {
        Reminder savedReminder = reminderService.createReminder(userId, reminder);
        return new ResponseEntity<>(savedReminder, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Reminder>> getAllRemindersForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reminderService.getRemindersByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reminder> getReminderByIdAndUser(@PathVariable Long userId, @PathVariable UUID id) {
        return reminderService.getReminderByIdAndUserId(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> updateReminder(@PathVariable Long userId, @PathVariable UUID id, @RequestBody Reminder reminder) {
        try {
            Reminder updatedReminder = reminderService.updateReminder(id, userId, reminder);
            return ResponseEntity.ok(updatedReminder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long userId, @PathVariable UUID id) {
        try {
            reminderService.deleteReminder(id, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}