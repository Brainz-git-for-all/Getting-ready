// src/main/java/com/example/demo/inventory/User/AuthRequest.java
package com.example.demo.inventory.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
    private String role;
}

