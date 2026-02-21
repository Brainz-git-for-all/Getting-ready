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

    /**
     * Retrieves all Sprints.
     * @return A list of all Sprint entities.
     */
    public List<Sprint> findAllSprints() {
        return sprintRepository.findAll();
    }

    /**
     * Retrieves a Sprint by its ID.
     * @param id The ID of the Sprint.
     * @return An Optional containing the Sprint, or empty if not found.
     */
    public Optional<Sprint> findSprintById(long id) {
        return sprintRepository.findById(id);
    }

    /**
     * Creates a new Sprint or updates an existing one.
     * @param sprint The Sprint entity to save.
     * @return The saved Sprint entity.
     */
    @Transactional // Ensures the entire method executes in a single transaction
    public Sprint saveSprint(Sprint sprint) {
        // You might add validation or additional business logic here
        return sprintRepository.save(sprint);
    }

    /**
     * Deletes a Sprint by its ID.
     * @param id The ID of the Sprint to delete.
     * @throws IllegalStateException if the Sprint is not found.
     */
    @Transactional
    public void deleteSprint(long id) {
        if (!sprintRepository.existsById(id)) {
            // Throw a custom exception like ResourceNotFoundException in a real app
            throw new IllegalStateException("Sprint with ID " + id + " not found.");
        }
        // Due to CascadeType.ALL in Sprint, all associated Tasks will also be deleted (orphanRemoval = true)
        sprintRepository.deleteById(id);
    }

    /**
     * Updates an existing Sprint.
     * @param id The ID of the Sprint to update.
     * @param updatedSprint The Sprint entity containing the new data.
     * @return The updated Sprint entity, or empty if the original Sprint was not found.
     */
    @Transactional
    public Optional<Sprint> updateSprint(long id, Sprint updatedSprint) {
        return sprintRepository.findById(id)
                .map(sprint -> {
                    // Update fields here:
                    sprint.setName(updatedSprint.getName());
                    sprint.setStartDate(updatedSprint.getStartDate());
                    sprint.setEndDate(updatedSprint.getEndDate());
                    // Tasks are handled separately, likely via a Task-specific endpoint
                    return sprintRepository.save(sprint);
                });
    }
    /**
     * Adds an existing or new Task to a specific Sprint.
     * @param sprintId The ID of the Sprint to add the Task to.
     * @param task The Task entity to be added (ID can be null for new Task).
     * @return The updated Sprint entity, or empty if Sprint is not found.
     */
    @Transactional
    public Optional<Sprint> addTaskToSprint(long sprintId, Task task) {
        return sprintRepository.findById(sprintId)
                .map(sprint -> {
                    // Set the bidirectional relationship
                    task.setSprint(sprint);

                    // Save the task (it will be persisted, and the sprint's task list will update)
                    // We use taskRepository.save() to ensure the Task has its ID generated if new.
                    Task savedTask = taskRepository.save(task);

                    // Add the task to the Sprint's collection (important for in-memory object consistency)
                    sprint.getTasks().add(savedTask);

                    // Due to CascadeType.ALL and JsonManagedReference/JsonBackReference setup,
                    // saving the Task ensures persistence and relationship management.
                    return sprintRepository.save(sprint);
                });
    }

    /**
     * Deletes a Task from a specific Sprint (and the database).
     * @param sprintId The ID of the Sprint containing the Task.
     * @param taskId The ID of the Task to delete.
     * @return The updated Sprint entity, or empty if Sprint or Task is not found.
     */
    @Transactional
    public Optional<Sprint> deleteTaskFromSprint(long sprintId, long taskId) {
        // 1. Find the Sprint
        return sprintRepository.findById(sprintId)
                .map(sprint -> {
                    // 2. Find the Task within the Sprint's tasks collection
                    boolean taskRemoved = sprint.getTasks().removeIf(task -> task.getId() == taskId);

                    if (taskRemoved) {
                        // 3. Delete the Task from the database (Crucial!)
                        // Orphan removal will handle this on the Sprint side, but
                        // explicitly deleting the task is cleaner/more explicit:
                        taskRepository.deleteById(taskId);

                        // 4. Save the Sprint (optional, as Task deletion is handled)
                        return sprintRepository.save(sprint);
                    } else {
                        // Task was not found in the Sprint's collection
                        throw new IllegalArgumentException("Task with ID " + taskId + " not found in Sprint " + sprintId);
                    }
                });
    }
}
