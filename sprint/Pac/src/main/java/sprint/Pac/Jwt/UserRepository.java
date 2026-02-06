package sprint.Pac.Jwt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.ResponseBody;

@ResponseBody
public interface UserRepository extends JpaRepository<User , Long> {
    User findByUsername(String username);

    boolean isUserNameExisting(String username);
}
