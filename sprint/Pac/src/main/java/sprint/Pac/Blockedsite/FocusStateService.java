package sprint.Pac.Blockedsite;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FocusStateService {

    // Tracks which users currently have an active Pomodoro timer (User ID -> Is Active)
    private final ConcurrentHashMap<Long, Boolean> activeFocusSessions = new ConcurrentHashMap<>();

    public void startFocus(Long userId) {
        activeFocusSessions.put(userId, true);
    }

    public void stopFocus(Long userId) {
        activeFocusSessions.put(userId, false);
    }

    public boolean isFocusActive(Long userId) {
        return activeFocusSessions.getOrDefault(userId, false);
    }
}