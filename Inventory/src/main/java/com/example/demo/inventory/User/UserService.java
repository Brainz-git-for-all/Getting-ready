package com.example.demo.inventory.User;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    // Create a new user
    public User createUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        return userRepository.save(user);
    }


    // Update an existing user
    public User updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.demo.inventory.Exceptions.ResourceNotFoundException("User not found with id: " + id));
        user.setUsername(updatedUser.getUsername());
        user.setPassword(updatedUser.getPassword());
        user.setRole(updatedUser.getRole());
        return userRepository.save(user);
    }

    // Delete a user by id
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.demo.inventory.Exceptions.ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }
    // Get a user by id
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new com.example.demo.inventory.Exceptions.ResourceNotFoundException("User not found with id: " + id));
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }



}
