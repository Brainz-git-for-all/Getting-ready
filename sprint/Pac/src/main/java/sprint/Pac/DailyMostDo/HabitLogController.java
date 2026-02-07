package sprint.Pac.DailyMostDo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:3000") // Allows React to connect
public class HabitLogController {

    @Autowired
    private HabitLogService logService;

    // 1. GET TODAY'S DATA
    @GetMapping("/{userId}/today")
    public ResponseEntity<DailySession> getToday(@PathVariable Long userId) {
        return logService.getLogByDate(userId, LocalDate.now())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. SAVE PROGRESS (The "End of Day" Popup Submit)
    // React sends: [true, false, true]
    @PostMapping("/{userId}/save")
    public ResponseEntity<DailySession> saveProgress(
            @PathVariable Long userId,
            @RequestBody List<Boolean> ticks) {

        DailySession saved = logService.saveDailyProgress(userId, ticks);
        return ResponseEntity.ok(saved);
    }

    // 3. DELETE LOG
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long sessionId) {
        logService.deleteLog(sessionId);
        return ResponseEntity.noContent().build();
    }
}