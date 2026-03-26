package sprint.Pac.Schedule;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schedule_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tells JPA to store "Monday", "Tuesday", etc. as Strings in the DB instead of numbers (0, 1, 2)
    @Enumerated(EnumType.STRING)
    private DayOfWeek day;

    private LocalTime startTime;
    private LocalTime endTime;

    // Optional: If you want to tie this schedule block to a specific user
    @Column(name = "user_id")
    private Long userId;

    // Since this is a list of basic Long values (not an Entity relationship),
    // we use @ElementCollection to store them in a separate, automatically managed table.
    // Inside ScheduleBlock.java

    @ElementCollection
    @CollectionTable(name = "schedule_block_tasks", joinColumns = @JoinColumn(name = "schedule_block_id"))
    @Column(name = "task_id")
    private List<Long> taskIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "schedule_block_habits", joinColumns = @JoinColumn(name = "schedule_block_id"))
    @Column(name = "habit_id")
    private List<Long> habitIds = new ArrayList<>();
}