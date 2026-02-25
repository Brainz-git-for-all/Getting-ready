package sprint.Pac.DailyMostDo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sprint.Pac.Jwt.User;
import sprint.Pac.Jwt.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HabitLogService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private DailySessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    // GET: Fetch a specific day
    public Optional<DailySession> getLogByDate(Long userId, LocalDate date) {
        return sessionRepository.findByUserIdAndLogDate(userId, date);
    }


    public Habit createHabit(Habit habit){
        return habitRepository.save(habit);
    }

    public List<Habit> getAllHabits(){
        return habitRepository.findAll();
    }

    public Habit getHabitsById(long id){
        return habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("this habit does not exist by id" + id));
    }


    public void  deleteHabit(long id){
      Habit habit =   habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("this habit does not exist by id" + id));
      habitRepository.delete(habit);
    }

    public Habit updateHabit(@org.jetbrains.annotations.NotNull Habit newHabit, long id){
        Habit habit =   habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("this habit does not exist by id" + id));
        habit.setName(newHabit.getName());
        habit.setUserId(newHabit.getUserId());

        return habitRepository.save(habit);
    }


    @Transactional
    public DailySession saveDailyProgress(Long userId, List<Long> habitIds) {
        // 1. (Optional) Validation
        // Instead of fetching the whole User object, just check if they exist.
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        // 2. Find existing session for today or initialize a new one
        DailySession session = sessionRepository.findByUserIdAndLogDate(userId, LocalDate.now())
                .orElseGet(() -> {
                    DailySession newSession = new DailySession();
                    newSession.setLogDate(LocalDate.now());
                    newSession.setUserId(userId); // Use the ID directly
                    newSession.setCompletedHabitIds(new ArrayList<>());
                    return newSession;
                });

        // 3. Update the habit list
        // It's safer to replace or clear/addAll as you did
        session.setCompletedHabitIds(new ArrayList<>(habitIds));

        return sessionRepository.save(session);
    }
}