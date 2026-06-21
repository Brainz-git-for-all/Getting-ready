package sprint.Pac.Sprint;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

                    List<Task> incoming = updatedSprint.getTasks() != null ? updatedSprint.getTasks() : new ArrayList<>();

                    // Collect IDs of tasks still in the updated list
                    Set<Long> incomingIds = incoming.stream()
                            .filter(t -> t.getId() != 0)
                            .map(Task::getId)
                            .collect(Collectors.toSet());

                    // Remove tasks that were deleted (orphanRemoval handles the DB delete)
                    sprint.getTasks().removeIf(t -> !incomingIds.contains(t.getId()));

                    // Update existing tasks or add new ones
                    for (Task t : incoming) {
                        if (t.getId() != 0) {
                            sprint.getTasks().stream()
                                    .filter(existing -> existing.getId() == t.getId())
                                    .findFirst()
                                    .ifPresent(existing -> {
                                        existing.setName(t.getName());
                                        existing.setPriority(t.getPriority());
                                        existing.setStartDate(t.getStartDate());
                                        existing.setEndDate(t.getEndDate());
                                        existing.setRemindAt(t.getRemindAt());
                                        existing.setCategory(t.getCategory());
                                        existing.setCompleted(t.getCompleted() != null ? t.getCompleted() : false);
                                    });
                        } else {
                            t.setSprint(sprint);
                            sprint.getTasks().add(t);
                        }
                    }

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

    // Add this new method inside SprintService.java
    @Transactional
    public Optional<Task> updateTaskCompletion(long sprintId, long taskId, boolean isCompleted) {
        return sprintRepository.findById(sprintId).flatMap(sprint -> {
            return sprint.getTasks().stream()
                    .filter(t -> t.getId() == taskId)
                    .findFirst()
                    .map(task -> {
                        task.setCompleted(isCompleted); // Update the status
                        return taskRepository.save(task);
                    });
        });
    }

}