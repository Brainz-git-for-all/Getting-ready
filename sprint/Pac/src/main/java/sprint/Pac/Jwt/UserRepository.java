package sprint.Pac.Jwt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.ResponseBody;

@Repository
public interface UserRepository extends JpaRepository<User , Long> {
    User findByUsername(String username);

    boolean existsByUsername(String username);
}
