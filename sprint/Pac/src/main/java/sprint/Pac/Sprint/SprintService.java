package sprint.Pac.Sprint;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;

    public SprintService(SprintRepository sprintRepository, TaskRepository taskRepository) {
        this.sprintRepository = sprintRepository;
        this.taskRepository = taskRepository;
    }

    public List<Sprint> findAllSprints() {
        return sprintRepository.findAll();
    }

    // <--- Added method to get sprints by User ID
    public List<Sprint> findAllSprintsByUserId(Long userId) {
        return sprintRepository.findAllByUserId(userId);
    }

    public Optional<Sprint> findSprintById(long id) {
        return sprintRepository.findById(id);
    }

    @Transactional
    public Sprint saveSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    @Transactional
    public void deleteSprint(long id) {
        if (!sprintRepository.existsById(id)) {
            throw new IllegalStateException("Sprint with ID " + id + " not found.");
        }
        sprintRepository.deleteById(id);
    }

    @Transactional
    public Optional<Sprint> updateSprint(long id, Sprint updatedSprint) {
        return sprintRepository.findById(id)
                .map(sprint -> {
                    sprint.setName(updatedSprint.getName());
                    sprint.setStartDate(updatedSprint.getStartDate());
                    sprint.setEndDate(updatedSprint.getEndDate());
                    // Not updating userId here assuming it doesn't change, but you can add it if needed
                    return sprintRepository.save(sprint);
                });
    }

    @Transactional
    public Optional<Sprint> addTaskToSprint(long sprintId, Task task) {
        return sprintRepository.findById(sprintId)
                .map(sprint -> {
                    // <--- VALIDATION: Ensure task dates are valid and fit inside the Sprint's timeline
                    if (task.getStartDate() == null || task.getEndDate() == null) {
                        throw new IllegalArgumentException("Task must have a valid start date and end date.");
                    }
                    if (task.getStartDate().isAfter(task.getEndDate())) {
                        throw new IllegalArgumentException("Task start date cannot be after its end date.");
                    }
                    if (sprint.getStartDate() != null && task.getStartDate().isBefore(sprint.getStartDate())) {
                        throw new IllegalArgumentException("Task cannot start before the Sprint starts (" + sprint.getStartDate() + ").");
                    }
                    if (sprint.getEndDate() != null && task.getEndDate().isAfter(sprint.getEndDate())) {
                        throw new IllegalArgumentException("Task cannot end after the Sprint ends (" + sprint.getEndDate() + ").");
                    }

                    task.setSprint(sprint);
                    Task savedTask = taskRepository.save(task);
                    sprint.getTasks().add(savedTask);
                    return sprintRepository.save(sprint);
                });
    }

    @Transactional
    public Optional<Sprint> deleteTaskFromSprint(long sprintId, long taskId) {
        return sprintRepository.findById(sprintId)
                .map(sprint -> {
                    boolean taskRemoved = sprint.getTasks().removeIf(task -> task.getId() == taskId);
                    if (taskRemoved) {
                        taskRepository.deleteById(taskId);
                        return sprintRepository.save(sprint);
                    } else {
                        throw new IllegalArgumentException("Task with ID " + taskId + " not found in Sprint " + sprintId);
                    }
                });
    }
}