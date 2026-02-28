package sprint.Pac.Sprint;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        List<Sprint> sprints = sprintService.findAllSprints();
        return ResponseEntity.ok(sprints);
    }

    // <--- Added endpoint to fetch sprints specific to a User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Sprint>> getSprintsByUserId(@PathVariable Long userId) {
        List<Sprint> sprints = sprintService.findAllSprintsByUserId(userId);
        return ResponseEntity.ok(sprints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable long id) {
        return sprintService.findSprintById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        Sprint savedSprint = sprintService.saveSprint(sprint);
        return new ResponseEntity<>(savedSprint, HttpStatus.CREATED);
    }

    @PostMapping("/{sprintId}/tasks")
    public ResponseEntity<?> addTaskToSprint(@PathVariable long sprintId, @RequestBody Task task) {
        try {
            return sprintService.addTaskToSprint(sprintId, task)
                    .map(sprint -> new ResponseEntity<>(sprint, HttpStatus.CREATED))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            // <--- Catch the Date validation error and return a 400 Bad Request
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{sprintId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTaskFromSprint(@PathVariable long sprintId, @PathVariable long taskId) {
        try {
            sprintService.deleteTaskFromSprint(sprintId, taskId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable long id, @RequestBody Sprint sprintDetails) {
        return sprintService.updateSprint(id, sprintDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable long id) {
        try {
            sprintService.deleteSprint(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    // Add this endpoint inside SprintController.java
    @PatchMapping("/{sprintId}/tasks/{taskId}/complete")
    public ResponseEntity<Task> toggleTaskCompletion(
            @PathVariable long sprintId,
            @PathVariable long taskId,
            @RequestParam boolean completed) {

        return sprintService.updateTaskCompletion(sprintId, taskId, completed)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}