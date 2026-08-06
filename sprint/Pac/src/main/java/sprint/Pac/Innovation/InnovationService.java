package sprint.Pac.Innovation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InnovationService {

    private final InnovationRepository innovationRepository;

    public Innovation create(Innovation innovation) {
        return innovationRepository.save(innovation);
    }

    public List<Innovation> getAllByUserId(Long userId) {
        return innovationRepository.findByUserId(userId);
    }

    public Innovation getById(Long id) {
        return innovationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Innovation not found with id: " + id));
    }

    public Innovation update(Long id, Innovation updated) {
        Innovation existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return innovationRepository.save(existing);
    }

    public void delete(Long id) {
        if (!innovationRepository.existsById(id)) {
            throw new RuntimeException("Innovation not found with id: " + id);
        }
        innovationRepository.deleteById(id);
    }
}
