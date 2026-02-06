package com.brainz.links.Link;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LinkService {

    private  static LinkRepository linkRepository ;

    public Link createLink(Link link){
       return linkRepository.save(link);
    }


    public Link getLinkById(Long id) {
        return linkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link not found with ID: " + id));
    }

    public List<Link> getAllLinks(){
        return linkRepository.findAll();
    }

    public void deleteByLink(long id){
        if(linkRepository.existsById(id)) {
            linkRepository.deleteById(id);
        }
        else {
            throw new RuntimeException("link not found with id: " + id);
        }
    }
    public  void delete(long id){
        Link deleteLink = linkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("This link does not exist by" + id));
        linkRepository.delete(deleteLink);
    }

    public Link updateLinkById(Link link, long id){
       Link linkToBeUpdated = linkRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Link does not exist"));
        linkToBeUpdated.setLink(link.getLink());
        linkToBeUpdated.setTime(link.getTime());
        linkToBeUpdated.setType(link.getType());

        return linkRepository.save(linkToBeUpdated);

    }



}
