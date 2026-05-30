package sprint.Pac.Ai;

import lombok.Data;
import java.util.List;

@Data
public class AiChatRequest {
    private Long userId;
    private List<ChatMessage> history; // Replaces single "message" string

    @Data
    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content; // The text or JSON proposal
    }
}