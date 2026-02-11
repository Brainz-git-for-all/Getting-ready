package sprint.Pac.Jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {
    @Value("${jwt.RefreshExpiration}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public RefreshToken createRefreshToken(String username) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(userRepository.findByUsername(username));
        refreshToken.setExpiryDate(java.time.Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(java.util.UUID.randomUUID().toString()); // Professional tip: Use UUID for refresh tokens, not JWTs!

        return refreshTokenRepository.save(refreshToken);
    }
}