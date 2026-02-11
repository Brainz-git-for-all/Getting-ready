// LoginRequest.java
package sprint.Pac.Jwt;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String username;
    private String password;
}