package sprint.Pac.Ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sprint.Pac.Activity.ActivityCategoryRepository;
import sprint.Pac.Sprint.SprintRepository;
import sprint.Pac.DailyMostDo.HabitRepository;
import sprint.Pac.Schedule.ScheduleBlockRepository;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiContextBuilder {
    private final SprintRepository sprintRepository;
    private final ActivityCategoryRepository categoryRepository;
    private final HabitRepository habitRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;

    public String buildFullContext(Long userId) {
        // 1. Fetch data (Ensure repositories return List<T>)
        var categories = categoryRepository.findByUserId(userId);
        var activeSprints = sprintRepository.findByUserId(userId);
        var habits = habitRepository.findByUserId(userId);
        var schedules = scheduleBlockRepository.findByUserId(userId);

        // 2. Format as clean strings (Safely handling null categories)
        String categoriesStr = categories.stream()
                .map(c -> "ID:" + c.getId() + " Name:" + c.getName())
                .collect(Collectors.joining(", "));

        // Replace your sprint mapping block with this
        String sprintsStr = activeSprints.stream()
                .map((sprint.Pac.Sprint.Sprint s) -> "ID:" + s.getId() + " Name:" + s.getName())
                .collect(Collectors.joining(", "));

        String habitsStr = habits.stream()
                .map(h -> "Habit:" + h.getName() + " (CatID:" +
                        (h.getCategory() != null ? h.getCategory().getId() : "None") + ")")
                .collect(Collectors.joining(", "));

        String scheduleStr = schedules.stream()
                .map(s -> s.getDay() + " " + s.getStartTime() + "-" + s.getEndTime() +
                        " (CatID:" + (s.getCategory() != null ? s.getCategory().getId() : "None") + ")")
                .collect(Collectors.joining(", "));

        // 3. Construct the prompt
        return """
            SYSTEM KNOWLEDGE:
            1. CATEGORIES AVAILABLE: %s
            2. ACTIVE SPRINTS: %s
            3. EXISTING HABITS: %s
            4. CURRENT SCHEDULE BLOCKS: %s
            
            RULES:
            - QuickTasks are standalone (no sprintId required).
            - Tasks MUST be linked to an existing sprintId provided above.
            - If suggesting a Task, Habit, or ScheduleBlock, assign a valid categoryId from the list.
            - If no Sprint is active, the AI must propose a new Sprint name.
            - For ScheduleBlocks, use UPPERCASE for day (e.g. MONDAY) and HH:mm for times.
            - NEVER schedule new items during existing Schedule Block time slots.
            """.formatted(
                categoriesStr.isEmpty() ? "NONE" : categoriesStr,
                sprintsStr.isEmpty() ? "NONE" : sprintsStr,
                habitsStr.isEmpty() ? "NONE" : habitsStr,
                scheduleStr.isEmpty() ? "NONE" : scheduleStr
        );
    }
}