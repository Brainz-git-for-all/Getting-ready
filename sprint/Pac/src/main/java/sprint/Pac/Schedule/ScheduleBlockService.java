package sprint.Pac.Schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleBlockService {
    @Autowired
    private ScheduleBlockRepository repository;

    // Helper class to hold absolute minutes of a week for overlap calculation
    private static class TimeRange {
        int start; int end;
        TimeRange(int start, int end) { this.start = start; this.end = end; }
    }

    // Advanced overlap logic handling week wrap-arounds (e.g., Sleep over midnight)
    private List<TimeRange> getRanges(ScheduleBlock b) {
        List<TimeRange> ranges = new ArrayList<>();
        if (b.getStartTime().equals(b.getEndTime())) return ranges;

        int dayOffset = b.getDay().getValue() - 1; // MONDAY=0, SUNDAY=6
        int timeStart = b.getStartTime().getHour() * 60 + b.getStartTime().getMinute();
        int timeEnd = b.getEndTime().getHour() * 60 + b.getEndTime().getMinute();

        int absoluteStart = dayOffset * 24 * 60 + timeStart;
        int absoluteEnd;

        if (timeStart < timeEnd) {
            absoluteEnd = dayOffset * 24 * 60 + timeEnd;
            ranges.add(new TimeRange(absoluteStart, absoluteEnd));
        } else {
            // Overnight block detected!
            int nextDayOffset = (dayOffset + 1) % 7;
            absoluteEnd = nextDayOffset * 24 * 60 + timeEnd;
            if (absoluteStart > absoluteEnd) {
                // Special Case: Sunday night wrapping to Monday morning
                ranges.add(new TimeRange(absoluteStart, 7 * 24 * 60)); // Sun night to End of Week
                ranges.add(new TimeRange(0, absoluteEnd));             // Start of Week to Mon morning
            } else {
                ranges.add(new TimeRange(absoluteStart, absoluteEnd));
            }
        }
        return ranges;
    }

    private boolean isOverlapping(ScheduleBlock b1, ScheduleBlock b2) {
        for (TimeRange r1 : getRanges(b1)) {
            for (TimeRange r2 : getRanges(b2)) {
                // If the largest start time is less than the smallest end time, they overlap
                if (Math.max(r1.start, r2.start) < Math.min(r1.end, r2.end)) {
                    return true;
                }
            }
        }
        return false;
    }

    public ScheduleBlock createScheduleBlock(ScheduleBlock newBlock) {
        if (newBlock.getStartTime().equals(newBlock.getEndTime())) {
            throw new IllegalArgumentException("Start time and end time cannot be exactly the same.");
        }
        List<ScheduleBlock> existing = repository.findByUserId(newBlock.getUser().getId());
        for (ScheduleBlock b : existing) {
            if (isOverlapping(newBlock, b)) {
                throw new IllegalArgumentException("Time overlaps with an existing block on " + b.getDay() + " (" + b.getCategory().getName() + ").");
            }
        }
        return repository.save(newBlock);
    }

    // NEW: Handles saving multiple days at once
    public List<ScheduleBlock> createBulkScheduleBlocks(List<ScheduleBlock> newBlocks) {
        if (newBlocks.isEmpty()) return new ArrayList<>();

        Long userId = newBlocks.get(0).getUser().getId();
        List<ScheduleBlock> existingDBBlocks = repository.findByUserId(userId);

        // 1. Check if the new blocks overlap with EXISTING blocks in the DB
        for (ScheduleBlock newBlock : newBlocks) {
            if (newBlock.getStartTime().equals(newBlock.getEndTime())) {
                throw new IllegalArgumentException("Start time and End time cannot be the same.");
            }
            for (ScheduleBlock existing : existingDBBlocks) {
                if (isOverlapping(newBlock, existing)) {
                    throw new IllegalArgumentException("Time overlaps with an existing block on " + existing.getDay() + " (" + existing.getCategory().getName() + ").");
                }
            }
        }

        // 2. Check if the new blocks overlap with EACH OTHER (in the same request)
        for (int i = 0; i < newBlocks.size(); i++) {
            for (int j = i + 1; j < newBlocks.size(); j++) {
                if (isOverlapping(newBlocks.get(i), newBlocks.get(j))) {
                    throw new IllegalArgumentException("The days you selected have overlapping times within this request.");
                }
            }
        }

        return repository.saveAll(newBlocks);
    }

    public ScheduleBlock updateScheduleBlock(Long id, ScheduleBlock updatedBlock) {
        ScheduleBlock existing = repository.findById(id).orElseThrow();
        List<ScheduleBlock> allBlocks = repository.findByUserId(existing.getUser().getId());

        for (ScheduleBlock b : allBlocks) {
            if (!b.getId().equals(id) && isOverlapping(updatedBlock, b)) {
                throw new IllegalArgumentException("Time overlaps with an existing block on " + b.getDay() + ".");
            }
        }
        existing.setDay(updatedBlock.getDay());
        existing.setStartTime(updatedBlock.getStartTime());
        existing.setEndTime(updatedBlock.getEndTime());
        existing.setCategory(updatedBlock.getCategory());
        existing.setRemindEnabled(updatedBlock.getRemindEnabled());
        existing.setRemindOffsetMinutes(updatedBlock.getRemindOffsetMinutes());
        return repository.save(existing);
    }

    public List<ScheduleBlock> getAllBlocksByUser(Long userId) { return repository.findByUserId(userId); }
    public List<ScheduleBlock> getBlocksByUserAndDay(Long userId, DayOfWeek day) { return repository.findByUserIdAndDay(userId, day); }
    public void deleteScheduleBlock(Long id) { repository.deleteById(id); }
}