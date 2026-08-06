package sprint.Pac.Innovation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/innovations")
@RequiredArgsConstructor
public class InnovationController {

    private final InnovationService innovationService;

    @PostMapping
    public ResponseEntity<Innovation> create(@RequestBody Innovation innovation) {
        return new ResponseEntity<>(innovationService.create(innovation), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Innovation>> getAllByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(innovationService.getAllByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Innovation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(innovationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Innovation> update(@PathVariable Long id, @RequestBody Innovation innovation) {
        return ResponseEntity.ok(innovationService.update(id, innovation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            innovationService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
