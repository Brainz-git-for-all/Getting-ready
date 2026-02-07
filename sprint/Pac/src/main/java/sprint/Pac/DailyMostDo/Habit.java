package sprint.Pac.DailyMostDo;

import jakarta.persistence.*;
import sprint.Pac.Jwt.User;

@Entity
@Table(name = "habits")
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "Gym", "Prayer"

    /**
     * This is the most important field for the bitmask!
     * If bitIndex = 0, this habit is the first bit in the completionMask.
     * If bitIndex = 1, it's the second bit, and so on.
     */
    private int bitIndex;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Constructors
    public Habit() {}

    public Habit(String name, int bitIndex, User user) {
        this.name = name;
        this.bitIndex = bitIndex;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getBitIndex() { return bitIndex; }
    public void setBitIndex(int bitIndex) { this.bitIndex = bitIndex; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}