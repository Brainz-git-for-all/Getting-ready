package sprint.Pac.Jwt;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    private String email;
    private String phoneNumber;

    // NEW: AI Context Memory (Stores onboarding questionnaire answers)
    @Column(columnDefinition = "TEXT", name = "ai_profile")
    private String aiProfile;

    public User(Long id, String username, String password, String email, String phoneNumber) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public User() {}
}