package sprint.Pac.Ai;
import lombok.Data;

@Data
public class AiHabitDto {
    private String name;
    private boolean badHabit;
    private Long categoryId;   // <-- CONSISTENCY FIX
    private String categoryName;
    private String remindTime;
}