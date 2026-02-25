package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private String name;

    // Change from User object to Long ID
    @Column(name = "user_id")
    private Long userId;
}