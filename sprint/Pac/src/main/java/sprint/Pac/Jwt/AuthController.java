package sprint.Pac.Jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
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

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Error: Username is required!");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new UserResponse(user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtUtil.generateTokenByUserName(loginRequest.getUsername());

        // Create the Refresh Token and save it to DB
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(loginRequest.getUsername());

        // Cookie for Access Token
        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", accessToken)
                .path("/")
                .maxAge(24 * 60 * 60) // Matches your JWT expiration
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .build();

        // Cookie for Refresh Token - Restricted to the refresh endpoint
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60) // 7 Days
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new UserResponse(loginRequest.getUsername()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@CookieValue(name = "refreshToken") String requestRefreshToken) {
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateTokenByUserName(user.getUsername());
                    ResponseCookie jwtCookie = ResponseCookie.from("accessToken", token)
                            .path("/").maxAge(24 * 60 * 60).httpOnly(true).build();
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                            .body("Token refreshed successfully");
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database or expired!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie jwtCookie = ResponseCookie.from("accessToken", "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .path("/api/auth/refresh") // MUST match the path in /login
                .maxAge(0)
                .httpOnly(true)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body("Logged out successfully");
    }
}