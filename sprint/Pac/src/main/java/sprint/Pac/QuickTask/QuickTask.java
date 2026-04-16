package sprint.Pac.QuickTask;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Activity.ActivityCategory;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quick_tasks")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class QuickTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String priority = "Medium";

    private LocalDate startDate;
    private LocalDate endDate;

    // NEW: Custom Reminder Time
    private LocalDateTime remindAt;

    @Column(name = "user_id")
    private Long userId;

    private Boolean completed = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}