package sprint.Pac.QuickTask;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quick-tasks")
public class QuickTaskController {

    private final QuickTaskService quickTaskService;

    @Autowired
    public QuickTaskController(QuickTaskService quickTaskService) {
        this.quickTaskService = quickTaskService;
    }

    @PostMapping
    public ResponseEntity<QuickTask> createQuickTask(@RequestBody QuickTask quickTask) {
        QuickTask createdTask = quickTaskService.createQuickTask(quickTask);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<QuickTask>> getAllQuickTasks() {
        return ResponseEntity.ok(quickTaskService.getAllQuickTasks());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuickTask>> getQuickTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(quickTaskService.getQuickTasksByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuickTask> getQuickTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(quickTaskService.getQuickTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuickTask> updateQuickTask(@PathVariable Long id, @RequestBody QuickTask quickTask) {
        return ResponseEntity.ok(quickTaskService.updateQuickTask(id, quickTask));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuickTask(@PathVariable Long id) {
        quickTaskService.deleteQuickTask(id);
        return ResponseEntity.noContent().build();
    }
}