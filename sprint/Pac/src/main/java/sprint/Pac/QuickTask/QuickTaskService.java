package sprint.Pac.QuickTask;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuickTaskService {

    private final QuickTaskRepository quickTaskRepository;

    @Autowired
    public QuickTaskService(QuickTaskRepository quickTaskRepository) {
        this.quickTaskRepository = quickTaskRepository;
    }

    public QuickTask createQuickTask(QuickTask quickTask) {
        return quickTaskRepository.save(quickTask);
    }

    public List<QuickTask> getAllQuickTasks() {
        return quickTaskRepository.findAll();
    }

    public List<QuickTask> getQuickTasksByUserId(Long userId) {
        return quickTaskRepository.findByUserId(userId);
    }

    public QuickTask getQuickTaskById(Long id) {
        return quickTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuickTask not found with id: " + id));
    }

    public QuickTask updateQuickTask(Long id, QuickTask updatedTask) {
        QuickTask existingTask = getQuickTaskById(id);

        existingTask.setName(updatedTask.getName());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setCompleted(updatedTask.getCompleted());
        existingTask.setCategory(updatedTask.getCategory());

        return quickTaskRepository.save(existingTask);
    }

    public void deleteQuickTask(Long id) {
        quickTaskRepository.deleteById(id);
    }
}