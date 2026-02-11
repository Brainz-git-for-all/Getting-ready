package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Jwt.User;

import java.time.LocalDate;
import java.util.List;




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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Long> getCompletedHabitIds() {
        return completedHabitIds;
    }

    public void setCompletedHabitIds(List<Long> completedHabitIds) {
        this.completedHabitIds = completedHabitIds;
    }
}