package sprint.Pac.Gym;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;


    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public Exercise createExercise(Exercise exercise){
        return exerciseRepository.save(exercise);
    }

    public Exercise getExerciseById(long id){
        return exerciseRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("This exercise does ont exist by " + id));
    }

    public List<Exercise> getAllExercise(){
        return exerciseRepository.findAll();
    }

    public void  deleteExercise(long id){

        Exercise deleteExercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("This exercise does ont exist by " + id));
        exerciseRepository.delete(deleteExercise);
    }

    public Exercise updateExercise(Exercise exercise, long id){
        Exercise existingExercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("This exercise does ont exist by " + id));

        existingExercise.setReps(exercise.getReps());
        existingExercise.setSets(exercise.getSets());
        existingExercise.setWorkout(exercise.getWorkout());
        existingExercise.setWorkoutType(exercise.getWorkoutType());

       return exerciseRepository.save(existingExercise);
    }

}


