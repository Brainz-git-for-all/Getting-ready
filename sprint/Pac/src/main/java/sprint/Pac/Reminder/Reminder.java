package sprint.Pac.Reminder;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data; // <-- ADD THIS
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data // <-- ADD THIS (so the Service can use .setName(), .setUserId(), etc.)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reminder")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // <-- CHANGE TO UUID (IDENTITY only works for Long/Int)
    private UUID id;

    private String name;
    private LocalDateTime remindAt;
    private LocalDateTime deadline;

    @Column(name = "user_id")
    private Long userId;
}