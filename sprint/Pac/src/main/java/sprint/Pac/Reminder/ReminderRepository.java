package sprint.Pac.Reminder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {

    // Find all reminders belonging to a specific user
    List<Reminder> findByUserId(Long userId);

    // Find a specific reminder ensuring it belongs to the user
    Optional<Reminder> findByIdAndUserId(UUID id, Long userId);
}