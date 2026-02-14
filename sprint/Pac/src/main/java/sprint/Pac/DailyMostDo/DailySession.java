package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sprint.Pac.Jwt.User;

import java.time.LocalDate;
import java.util.List;




@Setter
@Getter
@Entity
@Table(name = "daily_sessions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "logDate"})
})

public class DailySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate logDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection
    @CollectionTable(name = "daily_session_habit_ids", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "habit_id")
    private List<Long> completedHabitIds;

    public DailySession(User user, LocalDate logDate, List<Long> habitsId) {
        this.user = user;
        this.logDate = logDate;
        this.completedHabitIds = habitsId;
    }

    public DailySession(){

    }

}