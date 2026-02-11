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
    private RefreshTokenService refreshTokenService;

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
    public JwtResponse authenticateUser(@RequestBody LoginRequest loginRequest) {
        // ... authentication logic ...

        String accessToken = jwtUtil.generateTokenByUserName(loginRequest.getUsername());

        // Now this matches! The service returns the RefreshToken Object.
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(loginRequest.getUsername());

        return new JwtResponse(
                accessToken,
                refreshToken.getToken(), // Get the string from the object
                loginRequest.getUsername()
        );
    }
}