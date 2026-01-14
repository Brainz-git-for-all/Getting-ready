package com.brainz.links.User;


import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    public final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void createUser(User user){
        userRepository.save(user);
    }
    public List<User> getAllUsers(){
       return  userRepository.findAll();
    }
}
