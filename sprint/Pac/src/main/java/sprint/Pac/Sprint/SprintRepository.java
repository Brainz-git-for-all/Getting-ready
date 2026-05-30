package sprint.Pac.Sprint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findAllByUserId(Long userId);

    Object findFirstByUserIdAndEndDateGreaterThanEqual(Long userId, LocalDate endDateIsGreaterThan);

    List<Sprint> findByUserId(Long userId);
}
