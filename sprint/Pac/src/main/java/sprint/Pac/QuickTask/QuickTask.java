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

    // Custom Reminder Time
    private LocalDateTime remindAt;

    @Column(name = "user_id")
    private Long userId;

    // FIX: Using Boolean object wrapper to handle legacy NULL records
    private Boolean completed = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;

    // FIX: Using Boolean object wrapper to handle legacy NULL records
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;
}