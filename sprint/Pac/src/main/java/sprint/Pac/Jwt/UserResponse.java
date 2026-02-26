package sprint.Pac.Jwt;

import lombok.*;

@Getter
@Setter


public class UserResponse {
    private Long id;
    private String username;

    public UserResponse(String username) {

        this.username = username;
    }
    // You can add other non-sensitive fields here later, like:
    // private String email;
}