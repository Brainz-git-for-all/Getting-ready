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
                       user.getUsername(),
                       user.getRole()
                       )).collect(Collectors.toList());
    }

    public void deleteUserById(Long id){
        if (userRepository.existsById(id)){
           userRepository.deleteById(id);
        }
        else {
            throw new RuntimeException("user does exist by" + id);
        }

    }

    public User updateUserById(User user, long id){
       return userRepository.findById(id)
               .map(existingUser -> {
                   existingUser.setName(user.getName());
                   existingUser.setRole(user.getRole());
                   existingUser.setPassword(user.getPassword());

                   return userRepository.save(existingUser);
                       })
               .orElseThrow(() -> new RuntimeException("error"));
    }
}
