package sprint.Pac.Blockedsite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockedSiteRepository extends JpaRepository<BlockedSite, Long> {
    List<BlockedSite> findByUserId(Long userId);
}