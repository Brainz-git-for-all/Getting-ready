package sprint.Pac.DailyMostDo;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import sprint.Pac.DailyMostDo.DailySession;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailySessionRepository extends JpaRepository<DailySession, Long> {
    Optional<DailySession> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<DailySession> findAllByUserId(Long userId);
}