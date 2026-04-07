package sprint.Pac.Activity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class ActivityCategoryController {

    @Autowired
    private ActivityCategoryService service;

    // GET: /api/categories/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityCategory>> getCategoriesByUserId(@PathVariable Long userId) {
        List<ActivityCategory> categories = service.getCategoriesByUserId(userId);
        return ResponseEntity.ok(categories);
    }

    // POST: /api/categories
    @PostMapping
    public ResponseEntity<ActivityCategory> createCategory(@RequestBody ActivityCategory category) {
        ActivityCategory createdCategory = service.createCategory(category);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    // PUT: /api/categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ActivityCategory> updateCategory(@PathVariable Long id, @RequestBody ActivityCategory categoryDetails) {
        ActivityCategory updatedCategory = service.updateCategory(id, categoryDetails);
        return ResponseEntity.ok(updatedCategory);
    }

    // DELETE: /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}