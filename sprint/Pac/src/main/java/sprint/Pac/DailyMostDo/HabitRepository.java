package sprint.Pac.DailyMostDo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    // This query looks for the largest bitIndex assigned to a specific user
    @Query("SELECT MAX(h.bitIndex) FROM Habit h WHERE h.user.id = :userId")
    Optional<Integer> findMaxBitIndexByUserId(@Param("userId") Long userId);
}