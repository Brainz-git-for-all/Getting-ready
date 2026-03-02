package sprint.Pac.DailyMostDo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sprint.Pac.Jwt.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HabitLogService {

    private final HabitRepository habitRepository;
    private final DailySessionRepository sessionRepository;
    private final UserRepository userRepository;

    public Optional<DailySession> getLogByDate(Long userId, LocalDate date) {
        return sessionRepository.findByUserIdAndLogDate(userId, date);
    }

    public Habit createHabit(Habit habit) {
        return habitRepository.save(habit);
    }

    public Habit getHabitsById(long id) {
        return habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found: " + id));
    }

    public void deleteHabit(long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found: " + id));
        habitRepository.delete(habit);
    }

    @Transactional
    public Habit updateHabit(Habit newHabit, long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found: " + id));
        habit.setName(newHabit.getName());
        habit.setBadHabit(newHabit.getBadHabit()); // Updated to use getBadHabit()
        return habitRepository.save(habit);
    }

    @Transactional
    public DailySession saveDailyProgress(Long userId, List<Long> habitIds, LocalDate date) {
        if (!userRepository.existsById(userId)) throw new RuntimeException("User not found");

        DailySession session = sessionRepository.findByUserIdAndLogDate(userId, date)
                .orElseGet(() -> {
                    DailySession ns = new DailySession();
                    ns.setLogDate(date);
                    ns.setUserId(userId);
                    return ns;
                });

        session.setCompletedHabitIds(new ArrayList<>(habitIds));
        return sessionRepository.save(session);
    }

    public List<Habit> getHabitsByUserId(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public List<DailySession> findAllByUserId(Long id) {
        return sessionRepository.findAllByUserId(id);
    }
}