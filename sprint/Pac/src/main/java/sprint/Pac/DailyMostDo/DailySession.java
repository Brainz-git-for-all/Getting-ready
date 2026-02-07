package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import sprint.Pac.Jwt.User;

import java.time.LocalDate;

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

    private int completionMask;

    // Constructors
    public DailySession() {}

    public DailySession(User user, LocalDate logDate) {
        this.user = user;
        this.logDate = logDate;
    }

    // Helper methods for Bitwise logic
    public void setHabitComplete(int habitIndex) {
        this.completionMask |= (1 << habitIndex);
    }

    public boolean isHabitComplete(int habitIndex) {
        return (completionMask & (1 << habitIndex)) != 0;
    }

    // Standard Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getCompletionMask() { return completionMask; }
    public void setCompletionMask(int completionMask) { this.completionMask = completionMask; }
}