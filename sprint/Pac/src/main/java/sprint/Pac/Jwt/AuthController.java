// AuthController.java
package sprint.Pac.Jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return "Error: Username is already taken!";
        }

        // IMPORTANT: Always encode the password before saving!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        String token = jwtUtil.generateTokenByUserName(user.getUsername());

        // 3. Return the token so the frontend can store it
        return token;
    }

    @PostMapping("/login")
    public String authenticateUser(@RequestBody LoginRequest loginRequest) {
        // 1. Ask the manager to check the credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. If successful, set it in the security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate the token to give back to the user
        return jwtUtil.generateTokenByUserName(loginRequest.getUsername());
    }
}