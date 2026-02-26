@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class HabitLogController {

    private final HabitLogService habitLogService;

    // ADDED: This connects to habitService.getAll(userId) in React
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Habit>> getHabitsByUserId(@PathVariable Long userId) {
        return new ResponseEntity<>(habitLogService.getHabitsByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/log/user/{id}")
    public ResponseEntity<DailySession> getDailyLog(@PathVariable long id, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return habitLogService.getLogByDate(id, localDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new DailySession()));
    }

    @PostMapping
    public ResponseEntity<Habit> createNewHabit(@RequestBody Habit habit){
        return new ResponseEntity<>(habitLogService.createHabit(habit), HttpStatus.CREATED);
    }

    @PostMapping("/log/user/{id}")
    public ResponseEntity<DailySession> createNewSession(@RequestBody List<Long> habitIds, @PathVariable long id){
        return new ResponseEntity<>(habitLogService.saveDailyProgress(id, habitIds), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable long id) {
        habitLogService.deleteHabit(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}