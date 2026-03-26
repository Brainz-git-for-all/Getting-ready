package sprint.Pac.Schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleBlockService {

    @Autowired
    private ScheduleBlockRepository scheduleBlockRepository;

    public ScheduleBlock createScheduleBlock(ScheduleBlock newBlock) {

        // 1. Fetch all existing blocks for this user on this specific day
        List<ScheduleBlock> existingBlocks = scheduleBlockRepository
                .findByUserIdAndDay(newBlock.getUserId(), newBlock.getDay());

        // 2. Check for overlaps
        for (ScheduleBlock existing : existingBlocks) {
            boolean isOverlapping =
                    newBlock.getStartTime().isBefore(existing.getEndTime()) &&
                            newBlock.getEndTime().isAfter(existing.getStartTime());

            if (isOverlapping) {
                // If they overlap, throw an exception so it doesn't save!
                throw new IllegalArgumentException(
                        "This time block overlaps with an existing block from "
                                + existing.getStartTime() + " to " + existing.getEndTime()
                );
            }
        }

        // 3. Optional: Make sure Start Time is actually before End Time
        if (!newBlock.getStartTime().isBefore(newBlock.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }

        // 4. If no overlaps, save it to the database!
        return scheduleBlockRepository.save(newBlock);
    }
}