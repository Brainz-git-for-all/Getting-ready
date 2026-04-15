package sprint.Pac.QuickTask;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sprint.Pac.Activity.ActivityCategory;

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

    // NEW FIELD
    private String priority = "Medium";

    @Column(name = "user_id")
    private Long userId;

    private Boolean completed = false;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ActivityCategory category;
}