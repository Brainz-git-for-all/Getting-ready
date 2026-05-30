package sprint.Pac.Ai;
import lombok.Data;

@Data
public class AiQuickTaskDto {
    private String name;
    private String description;
    private String priority;
    private int durationDays;
    private Long categoryId;   // <-- CONSISTENCY FIX
    private String categoryName;
}