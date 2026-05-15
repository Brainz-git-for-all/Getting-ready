package sprint.Pac.Sprint;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sprint.Pac.Activity.ActivityCategory;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY )
    private long id;

    private String name;
    private String priority;
    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime remindAt;

    // FIX: Using Boolean object wrapper
    private Boolean completed = false;

    // FIX: Added reminder tracking for Sprints, using Boolean wrapper
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id" , nullable = false)
    @JsonBackReference
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}