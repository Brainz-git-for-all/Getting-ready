package sprint.Pac.Schedule;

import jakarta.persistence.*;
import lombok.*;
import sprint.Pac.Activity.ActivityCategory;
import sprint.Pac.Jwt.User;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "schedule_blocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ScheduleBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DayOfWeek day;

    private LocalTime startTime;
    private LocalTime endTime;

    // NEW: Schedule Reminder Logic
    @Column(name = "remind_enabled")
    private Boolean remindEnabled = false;

    @Column(name = "remind_offset_minutes")
    private Integer remindOffsetMinutes = 15;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}