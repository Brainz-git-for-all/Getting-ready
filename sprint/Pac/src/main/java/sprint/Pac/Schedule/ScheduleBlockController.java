package sprint.Pac.Schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/schedule-blocks")
public class ScheduleBlockController {

    @Autowired
    private ScheduleBlockService scheduleBlockService;

    @PostMapping
    public ResponseEntity<?> createBlock(@RequestBody ScheduleBlock newBlock) {
        try {
            return new ResponseEntity<>(scheduleBlockService.createScheduleBlock(newBlock), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // NEW BULK ENDPOINT: For Multiple Days
    @PostMapping("/bulk")
    public ResponseEntity<?> createBulkBlocks(@RequestBody List<ScheduleBlock> newBlocks) {
        try {
            return new ResponseEntity<>(scheduleBlockService.createBulkScheduleBlocks(newBlocks), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlock(@PathVariable Long id, @RequestBody ScheduleBlock updatedBlock) {
        try {
            return new ResponseEntity<>(scheduleBlockService.updateScheduleBlock(id, updatedBlock), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<ScheduleBlock>> getAllBlocksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(scheduleBlockService.getAllBlocksByUser(userId));
    }

    @GetMapping("/user/{userId}/day/{day}")
    public ResponseEntity<List<ScheduleBlock>> getBlocksByUserAndDay(
            @PathVariable Long userId,
            @PathVariable DayOfWeek day) {
        return ResponseEntity.ok(scheduleBlockService.getBlocksByUserAndDay(userId, day));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlock(@PathVariable Long id) {
        scheduleBlockService.deleteScheduleBlock(id);
        return ResponseEntity.ok("Deleted");
    }
}