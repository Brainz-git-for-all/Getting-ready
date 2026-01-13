package com.example.demo.inventory.User;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createToken(@RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        // Set JWT as HTTP-only cookie
        Cookie cookie = new Cookie("token", jwt);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);

        // Get role from userDetails
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("UNKNOWN");

        // Debug log for troubleshooting
        System.out.println("Login for user: " + request.getUsername() + ", role: " + role);

        // Only allow ADMIN, SELLER, STOCKER
        if (!(role.equals("ROLE_ADMIN") || role.equals("ROLE_SELLER") || role.equals("ROLE_STOCKER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid role: " + role);
        }

        return ResponseEntity.ok(Map.of("role", role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        String role = request.getRole();
        if (role == null || !(role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("SELLER") || role.equalsIgnoreCase("STOCKER"))) {
            return ResponseEntity.badRequest().body("Role must be ADMIN, SELLER, or STOCKER");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("ROLE_" + role.toUpperCase());

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully with role: " + newUser.getRole());
    }


    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("UNKNOWN");

        // Only allow ADMIN, SELLER, STOCKER
        if (!(role.equals("ROLE_ADMIN") || role.equals("ROLE_SELLER") || role.equals("ROLE_STOCKER"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid role");
        }

        return ResponseEntity.ok(Map.of("role", role));
    }
}