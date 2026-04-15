package sprint.Pac.Blockedsite;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class BlockedSite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String url; // e.g., "youtube.com"
}