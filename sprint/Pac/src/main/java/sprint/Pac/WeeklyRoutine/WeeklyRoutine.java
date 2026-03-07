package sprint.Pac.WeeklyRoutine;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table
@Getter
@Setter
public class WeeklyRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private  String  name;
    private LocalDateTime localDateTime;
    private Boolean reOccurrence;
    private Boolean isFinished;
}
