package sprint.Pac.Link;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "link")
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // FIXED: Changed from float to Long

    private String link;
    private LocalDateTime remindAt;
    private LocalDateTime lookUpDeadline;
    private String category;

    @Column(name = "user_id")
    private Long userId; // Added to tie link to user
}