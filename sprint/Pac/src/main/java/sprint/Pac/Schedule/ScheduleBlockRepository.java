package sprint.Pac.Schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, Long> {
    // Finds all blocks for a user on a specific day
    List<ScheduleBlock> findByUserIdAndDay(Long userId, DayOfWeek day);
}