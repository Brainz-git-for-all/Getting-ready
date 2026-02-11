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
        habit.setUser(newHabit.getUser());

        return habitRepository.save(habit);
    }


    @Transactional
    public DailySession saveDailyProgress(Long userId, List<Long> habitId) {
        // 1. Get the user (or throw error if not found)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find existing session for today or create a new one
        DailySession session = sessionRepository.findByUserIdAndLogDate(userId, LocalDate.now())
                .orElseGet(() -> {
                    DailySession dailySession = new DailySession();
                    dailySession.setLogDate(LocalDate.now());
                    dailySession.setUser(user);
                    dailySession.setCompletedHabitIds(new ArrayList<>());
                    return dailySession;
        });

         session.getCompletedHabitIds().clear();
         session.getCompletedHabitIds().addAll(habitId);
         return sessionRepository.save(session);
    }
}