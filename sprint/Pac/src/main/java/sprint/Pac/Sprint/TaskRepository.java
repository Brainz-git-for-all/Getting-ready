package sprint.Pac.Sprint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Finds Sprint tasks due within a time window, NOT completed, and NOT already sent
    List<Task> findByRemindAtBetweenAndCompletedFalseAndReminderSentFalse(LocalDateTime start, LocalDateTime end);
}