package com.brainz.links.User;


import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    public final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void createUser(User user){
        userRepository.save(user);
    }
    public List<UserDTO> getAllUsers(){
       return  userRepository.findAll()
               .stream()
               .map( user -> new UserDTO(
                       user.getName(),
                       user.getRole()
                       )).collect(Collectors.toList());
    }
}
