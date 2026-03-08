package sprint.Pac.Link;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LinkService {

    // Removed 'static', as it breaks Spring Dependency Injection
    private final LinkRepository linkRepository;

    public Link createLink(Link link){
        return linkRepository.save(link);
    }

    public Link getLinkById(Long id) {
        return linkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link not found with ID: " + id));
    }

    public List<Link> getAllLinksByUserId(Long userId){
        return linkRepository.findByUserId(userId);
    }

    public void deleteByLink(long id){
        if(linkRepository.existsById(id)) {
            linkRepository.deleteById(id);
        } else {
            throw new RuntimeException("link not found with id: " + id);
        }
    }

    public Link updateLinkById(Link link, long id){
        Link linkToBeUpdated = linkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link does not exist"));

        linkToBeUpdated.setLink(link.getLink());
        linkToBeUpdated.setLookUpDeadline(link.getLookUpDeadline());
        linkToBeUpdated.setCategory(link.getCategory());
        linkToBeUpdated.setRemindAt(link.getRemindAt());
        linkToBeUpdated.setDescription(link.getDescription());
        // Note: We don't update the userId here to prevent transferring ownership

        return linkRepository.save(linkToBeUpdated);
    }
}