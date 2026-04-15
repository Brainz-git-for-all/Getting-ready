package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Activity.ActivityCategory;

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

    @Column(name = "user_id")
    private Long userId;



    @Column(name = "bad_habit")
    private Boolean badHabit = false; // Changed from boolean to Boolean to allow null assignment gracefully

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}