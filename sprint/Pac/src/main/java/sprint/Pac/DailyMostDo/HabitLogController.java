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
        return new ResponseEntity<>(habitLogService.getHabitsById(id),HttpStatus.OK);
    }

    @GetMapping("/log/user/{id}")
    public ResponseEntity<DailySession> getDailyLog(@PathVariable long id, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return habitLogService.getLogByDate(id, localDate)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // FIXED: Initialize empty array so frontend doesn't crash on .includes()
                    DailySession emptySession = new DailySession();
                    emptySession.setCompletedHabitIds(new ArrayList<>());
                    return ResponseEntity.ok(emptySession);
                });
    }

    @PostMapping
    public ResponseEntity<Habit> createNewHabit(@RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.createHabit(habit), HttpStatus.CREATED);
    }

    // FIXED: Added @RequestParam String date to fetch exactly what day React says it is
    @PostMapping("/log/user/{id}")
    public ResponseEntity<DailySession> createNewSession(
            @RequestBody List<Long> habit,
            @PathVariable long id,
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        // FIXED: Passed localDate to the service method
        return new ResponseEntity<>(habitLogService.saveDailyProgress(id, habit, localDate), HttpStatus.CREATED);
    }
    @GetMapping("all/logs/user/{id}")
    public ResponseEntity<List<DailySession>> getAllSessionById(@PathVariable Long id){
        return new ResponseEntity<>(habitLogService.findAllByUserId(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable long id) {
        try {
            habitLogService.deleteHabit(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable long id, @RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.updateHabit(habit, id), HttpStatus.OK);
    }
}