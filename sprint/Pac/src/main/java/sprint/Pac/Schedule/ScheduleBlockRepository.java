package sprint.Pac.Schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.List;

public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock, Long> {
    List<ScheduleBlock> findByUserIdAndDay(Long userId, DayOfWeek day);

    // ADD THIS: To fetch all blocks for the dashboard
    List<ScheduleBlock> findByUserId(Long userId);
}