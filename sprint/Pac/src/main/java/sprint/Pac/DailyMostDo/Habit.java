package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Activity.ActivityCategory;

import java.time.LocalDate;
import java.time.LocalTime;

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
    private Boolean badHabit = false;

    // NEW: Reminder Data
    @Column(name = "remind_enabled")
    private Boolean remindEnabled = false;

    @Column(name = "remind_time")
    private LocalTime remindTime;

    // NEW: Prevents daily spam
    @Column(name = "last_reminded_date")
    private LocalDate lastRemindedDate;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}