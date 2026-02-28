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

    // FIXED: Added 'final' keyword so @RequiredArgsConstructor actually injects them
    private final HabitRepository habitRepository;
    private final DailySessionRepository sessionRepository;
    private final UserRepository userRepository;

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

    public void deleteHabit(long id){
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("this habit does not exist by id" + id));
        habitRepository.delete(habit);
    }

    public Habit updateHabit(@org.jetbrains.annotations.NotNull Habit newHabit, long id){
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("this habit does not exist by id" + id));
        habit.setName(newHabit.getName());
        habit.setUserId(newHabit.getUserId());

        return habitRepository.save(habit);
    }

    @Transactional
    // FIXED: Added 'LocalDate date' so the server syncs with the user's timezone date
    public DailySession saveDailyProgress(Long userId, List<Long> habitIds, LocalDate date) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        // FIXED: Replaced LocalDate.now() with the 'date' passed from React
        DailySession session = sessionRepository.findByUserIdAndLogDate(userId, date)
                .orElseGet(() -> {
                    DailySession newSession = new DailySession();
                    newSession.setLogDate(date); // Use exact date here too
                    newSession.setUserId(userId);
                    newSession.setCompletedHabitIds(new ArrayList<>());
                    return newSession;
                });

        session.setCompletedHabitIds(new ArrayList<>(habitIds));

        return sessionRepository.save(session);
    }

    public List<Habit> getHabitsByUserId(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public  List<DailySession> findAllByUserId(Long id){
        userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("user name does not exist by id " + id));
         return  sessionRepository.findAllByUserId(id);
    }
}