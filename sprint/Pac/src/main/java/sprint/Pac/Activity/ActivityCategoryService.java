package sprint.Pac.Activity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityCategoryService {

    @Autowired
    private ActivityCategoryRepository repository;

    // Get all categories for a specific user
    public List<ActivityCategory> getCategoriesByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    // Create a new category
    public ActivityCategory createCategory(ActivityCategory category) {
        return repository.save(category);
    }

    // Update an existing category
    public ActivityCategory updateCategory(Long id, ActivityCategory categoryDetails) {
        ActivityCategory existingCategory = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        existingCategory.setName(categoryDetails.getName());
        existingCategory.setColor(categoryDetails.getColor());
        // We typically don't update the userId once it's set

        return repository.save(existingCategory);
    }

    // Delete a category
    public void deleteCategory(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        repository.deleteById(id);
    }
}