package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Jwt.User;

@Entity
@Table(name = "habits")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "Gym", "Prayer"

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}