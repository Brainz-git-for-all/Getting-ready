package sprint.Pac.QuickTask;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuickTaskRepository extends JpaRepository<QuickTask, Long> {
    // Custom derived query to find all quick tasks for a specific user
    List<QuickTask> findByUserId(Long userId);
}