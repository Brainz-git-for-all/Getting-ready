package sprint.Pac.Activity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ActivityCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;
    private Long userId; // The ID from your React Frontend
}