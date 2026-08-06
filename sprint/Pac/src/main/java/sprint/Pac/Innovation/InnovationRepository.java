package sprint.Pac.Innovation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InnovationRepository extends JpaRepository<Innovation, Long> {
    List<Innovation> findByUserId(Long userId);
}
