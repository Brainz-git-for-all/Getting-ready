package com.brainz.links;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.NewConstructorTypeMunger;
import org.springframework.context.annotation.ReflectiveScan;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@ReflectiveScan
@RequestMapping("api/Links")

public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping()

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteLinkById(@PathVariable long id){
        try{
            linkService.deleteByLink(id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        catch (RuntimeException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }
}
