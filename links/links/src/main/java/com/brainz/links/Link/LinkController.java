package com.brainz.links.Link;

import com.brainz.links.Link.Link;
import com.brainz.links.Link.LinkService;

import org.springframework.context.annotation.ReflectiveScan;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@ReflectiveScan
@RequestMapping("api/Links")

public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping
    public ResponseEntity<Link> createLink(Link link){
     Link savedLink =  linkService.createLink(link);
        return new ResponseEntity<>(savedLink, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Link>> getAlllinks(){
        List<Link> links = linkService.getAllLinks();
        return new ResponseEntity<>(links, HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Link> getByLinkId(@PathVariable long id){
       Link link = linkService.getLinkById(id);
        return new ResponseEntity<>(link , HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLinkById(@PathVariable long id) {
        try {
            linkService.deleteByLink(id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

        @PutMapping("/{id}")
         public ResponseEntity<Link>  updateLinkById(@PathVariable long id , @RequestBody Link link){
            return new ResponseEntity<>(linkService.updateLinkById(link,id), HttpStatus.OK);

        }

}
