package com.example.demo.inventory.User;


import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/user")
@CrossOrigin("*")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	// Create user
	@PostMapping
	public User createUser(@RequestBody User user) {
		return userService.createUser(user);
	}

	// Get user by id
	@GetMapping("/{id}")
	public User getUserById(@PathVariable Long id) {
		return userService.getUserById(id);
	}

	// Get all users
	@GetMapping
	public java.util.List<User> getAllUsers() {
		return userService.getAllUsers();
	}

	// Update user
	@PutMapping("/{id}")
	public User updateUser(@PathVariable Long id,
						   @RequestBody User user) {
		return userService.updateUser(id, user);
	}

	// Delete user
	@DeleteMapping("/{id}")
	public void deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
	}

}
