package sprint.Pac.DailyMostDo;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Allows React to connect
public class HabitLogController {


    private final HabitLogService habitLogService;

    // To this:
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
                .orElse(ResponseEntity.ok(new DailySession())); // Return empty session if none found
    }

    @PostMapping
    public ResponseEntity<Habit> createNewHabit(@RequestBody Habit habit){

        return new ResponseEntity<>(habitLogService.createHabit(habit), HttpStatus.CREATED);
    }

    @PostMapping("/log/user/{id}")
    public ResponseEntity<DailySession> createNewSession(@RequestBody List<Long> habit, @PathVariable long id){
        return new ResponseEntity<>(habitLogService.saveDailyProgress(id , habit), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable long id) {
        try {
            habitLogService.deleteHabit(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Success
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Habit didn't exist
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable long id, @RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.updateHabit(habit, id), HttpStatus.OK);
    }


  }