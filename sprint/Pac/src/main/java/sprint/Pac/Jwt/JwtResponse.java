package sprint.Pac.Jwt;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    private String username;
    // You can add roles here later (e.g., private List<String> roles;)

    public JwtResponse(String accessToken, String refreshToken, String username) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.username = username;
    }

}