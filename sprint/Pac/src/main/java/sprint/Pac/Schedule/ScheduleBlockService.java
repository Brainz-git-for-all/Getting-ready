package sprint.Pac.Schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
@Service
public class ScheduleBlockService {
    @Autowired
    private ScheduleBlockRepository repository;

    public ScheduleBlock createScheduleBlock(ScheduleBlock newBlock) {
        if (!newBlock.getStartTime().isBefore(newBlock.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }
        // Use user.getId() instead of userId
        List<ScheduleBlock> existing = repository.findByUserIdAndDay(newBlock.getUser().getId(), newBlock.getDay());

        for (ScheduleBlock b : existing) {
            if (newBlock.getStartTime().isBefore(b.getEndTime()) && newBlock.getEndTime().isAfter(b.getStartTime())) {
                throw new IllegalArgumentException("Overlap detected.");
            }
        }
        return repository.save(newBlock);
    }

    public List<ScheduleBlock> getAllBlocksByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public List<ScheduleBlock> getBlocksByUserAndDay(Long userId, DayOfWeek day) {
        return repository.findByUserIdAndDay(userId, day);
    }

    public void deleteScheduleBlock(Long id) {
        repository.deleteById(id);
    }
}