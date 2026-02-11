package sprint.Pac.Gym;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("api/exercise")
public class ExerciseController {


    private final ExerciseService exerciseService;



    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }


    @PostMapping
    public ResponseEntity<Exercise> createExercise(@RequestBody Exercise exercise){
        return new  ResponseEntity<>(exerciseService.createExercise(exercise), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercise(){
        return new ResponseEntity<>(exerciseService.getAllExercise(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseBId(@PathVariable long id){
        return new ResponseEntity<>(exerciseService.getExerciseById(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable long id){
        try {
            exerciseService.deleteExercise(id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateExercise(@PathVariable long id , @RequestBody Exercise exercise){
        return new ResponseEntity<>(exerciseService.updateExercise(exercise,id), HttpStatus.OK);

    }





}
