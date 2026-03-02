package sprint.Pac.DailyMostDo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
public class HabitLogController {

    private final HabitLogService habitLogService;

    @Autowired
    public HabitLogController(HabitLogService habitLogService) {
        this.habitLogService = habitLogService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Habit>> getUserHabits(@PathVariable Long userId) {
        return new ResponseEntity<>(habitLogService.getHabitsByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable long id){
        return new ResponseEntity<>(habitLogService.getHabitsById(id), HttpStatus.OK);
    }

    @GetMapping("/log/user/{id}")
    public ResponseEntity<DailySession> getDailyLog(@PathVariable long id, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return habitLogService.getLogByDate(id, localDate)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    DailySession emptySession = new DailySession();
                    emptySession.setCompletedHabitIds(new ArrayList<>());
                    return ResponseEntity.ok(emptySession);
                });
    }

    @PostMapping
    public ResponseEntity<Habit> createNewHabit(@RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.createHabit(habit), HttpStatus.CREATED);
    }

    @PostMapping("/log/user/{id}")
    public ResponseEntity<DailySession> saveDailyLog(
            @RequestBody List<Long> habitIds,
            @PathVariable long id,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        return new ResponseEntity<>(habitLogService.saveDailyProgress(id, habitIds, localDate), HttpStatus.CREATED);
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<DailySession>> getAllLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(habitLogService.findAllByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable long id) {
        habitLogService.deleteHabit(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable long id, @RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.updateHabit(habit, id), HttpStatus.OK);
    }
}