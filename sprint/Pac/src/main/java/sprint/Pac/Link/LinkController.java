package sprint.Pac.Link;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/links") // Standardized to lowercase
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping
    // Added @RequestBody so Spring parses the JSON payload properly
    public ResponseEntity<Link> createLink(@RequestBody Link link){
        Link savedLink = linkService.createLink(link);
        return new ResponseEntity<>(savedLink, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Link>> getLinksByUserId(@PathVariable Long userId){
        List<Link> links = linkService.getAllLinksByUserId(userId);
        return new ResponseEntity<>(links, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Link> getByLinkId(@PathVariable long id){
        Link link = linkService.getLinkById(id);
        return new ResponseEntity<>(link, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLinkById(@PathVariable long id) {
        try {
            linkService.deleteByLink(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content is standard for successful deletions
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Link> updateLinkById(@PathVariable long id, @RequestBody Link link){
        return new ResponseEntity<>(linkService.updateLinkById(link, id), HttpStatus.OK);
    }
}