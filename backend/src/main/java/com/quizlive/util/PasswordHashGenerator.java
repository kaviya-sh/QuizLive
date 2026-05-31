package com.quizlive.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "demo123";
        String hash = encoder.encode(password);
        
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println();
        System.out.println("-- Demo Participant");
        System.out.println("INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)");
        System.out.println("VALUES ('demo@sparklo.in', '" + hash + "', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), true)");
        System.out.println("ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;");
        System.out.println();
        System.out.println("-- Demo Host");
        System.out.println("INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)");
        System.out.println("VALUES ('demohost@sparklo.in', '" + hash + "', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), true)");
        System.out.println("ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;");
    }
}
