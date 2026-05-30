package sprint.Pac.Ai;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AiTaskDto {
    private String name;
    private String priority;
    private LocalDate endDate;
    private Long categoryId;   // For existing categories
    private String categoryName; // For newly invented categories
    private Long sprintId;
    private String description;
}