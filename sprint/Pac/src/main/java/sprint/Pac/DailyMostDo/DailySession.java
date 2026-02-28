package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "daily_sessions", uniqueConstraints = {
        // FIXED: "logDate" changed to "log_date" to match database column naming
        @UniqueConstraint(columnNames = {"user_id", "log_date"})
})
@Getter
@Setter
@NoArgsConstructor
public class DailySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate logDate;

    @Column(name = "user_id")
    private Long userId;

    @ElementCollection
    @CollectionTable(name = "daily_session_habit_ids", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "habit_id")
    private List<Long> completedHabitIds;

    public DailySession(Long userId, LocalDate logDate, List<Long> completedHabitIds) {
        this.userId = userId;
        this.logDate = logDate;
        this.completedHabitIds = completedHabitIds;
    }
}