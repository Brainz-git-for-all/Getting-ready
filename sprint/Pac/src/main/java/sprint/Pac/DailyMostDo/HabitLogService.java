package sprint.Pac.DailyMostDo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sprint.Pac.Jwt.User;
import sprint.Pac.Jwt.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HabitLogService {

    @Autowired
    private DailySessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    // GET: Fetch a specific day
    public Optional<DailySession> getLogByDate(Long userId, LocalDate date) {
        return sessionRepository.findByUserIdAndLogDate(userId, date);
    }

    // CREATE or UPDATE: Using the Bitmask logic
    @Transactional
    public DailySession saveDailyProgress(Long userId, List<Boolean> ticks) {
        // 1. Get the user (or throw error if not found)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find existing session for today or create a new one
        DailySession session = sessionRepository.findByUserIdAndLogDate(userId, LocalDate.now())
                .orElse(new DailySession(user, LocalDate.now()));

        // 3. Convert List<Boolean> [true, false, true] into an Integer Bitmask (e.g., 5)
        int mask = 0;
        for (int i = 0; i < ticks.size(); i++) {
            if (ticks.get(i)) {
                mask |= (1 << i); // Setting the bit at position i
            }
        }

        session.setCompletionMask(mask);
        return sessionRepository.save(session);
    }

    // DELETE: Clear the log for a specific day
    @Transactional
    public void deleteLog(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}