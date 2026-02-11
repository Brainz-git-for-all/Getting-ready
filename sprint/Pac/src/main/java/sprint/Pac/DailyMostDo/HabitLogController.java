package sprint.Pac.DailyMostDo;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Allows React to connect
public class HabitLogController {

    @Autowired
    private final HabitLogService habitLogService;

    @GetMapping
    public ResponseEntity<List<Habit>> getAllHabits(){
        return new ResponseEntity<>(habitLogService.getAllHabits(), HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity<List<Habit>> getAllHabits1(){
        List<Habit> habits = habitLogService.getAllHabits();
        return  ResponseEntity.ok().body(habits);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable long id){

        return new ResponseEntity<>(habitLogService.getHabitsById(id),HttpStatus.OK);
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
    public ResponseEntity<Void> deleteHabit(@PathVariable long id){

        try {
            habitLogService.deleteHabit(id);
            return new ResponseEntity<>( HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable long id, @RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.updateHabit(habit, id), HttpStatus.OK);
    }
  }