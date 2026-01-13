package sprint.Pac.Sprint;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints") // Base URL for all Sprint endpoints
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    /**
     * GET /api/sprints
     * Retrieves all sprints.
     * @return A list of all Sprint entities.
     */
    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        List<Sprint> sprints = sprintService.findAllSprints();
        return ResponseEntity.ok(sprints); // HTTP 200 OK
    }

    /**
     * GET /api/sprints/{id}
     * Retrieves a sprint by its ID.
     * @param id The ID of the Sprint.
     * @return The requested Sprint, or 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable long id) {
        return sprintService.findSprintById(id)
                .map(ResponseEntity::ok) // If present, return 200 OK
                .orElseGet(() -> ResponseEntity.notFound().build()); // If not present, return 404 Not Found
    }

    /**
     * POST /api/sprints
     * Creates a new sprint.
     * @param sprint The Sprint object from the request body.
     * @return The created Sprint with HTTP 201 Created status.
     */
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        Sprint savedSprint = sprintService.saveSprint(sprint);
        // Returns 201 Created and the location of the new resource (optional, but good practice)
        return new ResponseEntity<>(savedSprint, HttpStatus.CREATED);
    }

    /**
     * PUT /api/sprints/{id}
     * Updates an existing sprint.
     * @param id The ID of the Sprint to update.
     * @param sprintDetails The updated Sprint data.
     * @return The updated Sprint, or 404 Not Found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable long id, @RequestBody Sprint sprintDetails) {
        return sprintService.updateSprint(id, sprintDetails)
                .map(ResponseEntity::ok) // If updated, return 200 OK
                .orElseGet(() -> ResponseEntity.notFound().build()); // If not found, return 404 Not Found
    }

    /**
     * DELETE /api/sprints/{id}
     * Deletes a sprint by ID.
     * @param id The ID of the Sprint to delete.
     * @return HTTP 204 No Content, or 404 Not Found (if service throws an exception).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable long id) {
        try {
            sprintService.deleteSprint(id);
            // HTTP 204 No Content is the standard response for a successful DELETE
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            // Catches the exception thrown by the Service layer if not found
            return ResponseEntity.notFound().build(); // HTTP 404 Not Found
        }
    }

    /**
     * POST /api/sprints/{sprintId}/tasks
     * Adds a new Task to the specified Sprint.
     * @param sprintId The ID of the Sprint.
     * @param task The Task entity from the request body.
     * @return The updated Sprint, or 404 Not Found.
     */
    @PostMapping("/{sprintId}/tasks")
    public ResponseEntity<Sprint> addTaskToSprint(@PathVariable long sprintId, @RequestBody Task task) {
        return sprintService.addTaskToSprint(sprintId, task)
                .map(sprint -> new ResponseEntity<>(sprint, HttpStatus.CREATED))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/sprints/{sprintId}/tasks/{taskId}
     * Deletes a Task from the specified Sprint.
     * @param sprintId The ID of the Sprint.
     * @param taskId The ID of the Task to delete.
     * @return HTTP 204 No Content, or 404 Not Found if Sprint/Task doesn't exist in that Sprint.
     */
    @DeleteMapping("/{sprintId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTaskFromSprint(@PathVariable long sprintId, @PathVariable long taskId) {
        try {
            sprintService.deleteTaskFromSprint(sprintId, taskId);
            return ResponseEntity.noContent().build(); // HTTP 204 No Content
        } catch (IllegalArgumentException e) {
            // Task not found in Sprint, or Sprint not found (depending on detailed error handling)
            return ResponseEntity.notFound().build(); // HTTP 404 Not Found
        }
    }
}
