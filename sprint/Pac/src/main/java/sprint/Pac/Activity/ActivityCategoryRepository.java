package sprint.Pac.Activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityCategoryRepository extends JpaRepository<ActivityCategory, Long> {

    // Custom method to fetch categories for a specific user
    List<ActivityCategory> findByUserId(Long userId);
}