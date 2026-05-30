package sprint.Pac.Ai;

import lombok.Data;
import java.util.List;

@Data
public class AiProposalAcceptRequest {
    private Long userId;

    private Long sprintId;
    private String sprintName;
    private int durationDays;

    private List<AiTaskDto> tasks;
    private List<AiQuickTaskDto> quickTasks; // <-- CRITICAL: Must be exact match!
    private List<AiHabitDto> habits;
    private List<AiScheduleBlockDto> scheduleBlocks;
}