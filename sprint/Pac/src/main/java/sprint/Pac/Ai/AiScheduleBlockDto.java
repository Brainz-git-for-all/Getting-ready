package sprint.Pac.Ai;
import lombok.Data;

@Data
public class AiScheduleBlockDto {
    private String day;
    private String startTime;
    private String endTime;
    private Long categoryId;   // <-- CONSISTENCY FIX
    private String categoryName;
}