package com.quizlive.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Utility to generate BCrypt password hashes for database seeding
 * Run this class to generate hashes for demo users
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== Password Hash Generator ===");
        System.out.println();
        
        // Generate hash for demo123
        String demoPassword = "demo123";
        String demoHash = encoder.encode(demoPassword);
        System.out.println("Password: demo123");
        System.out.println("Hash: " + demoHash);
        System.out.println();
        
        // Verify the hash works
        boolean matches = encoder.matches(demoPassword, demoHash);
        System.out.println("Verification: " + (matches ? "SUCCESS" : "FAILED"));
        System.out.println();
        
        // Generate SQL update statement
        System.out.println("=== SQL Update Statement ===");
        System.out.println("UPDATE users SET password_hash = '" + demoHash + "'");
        System.out.println("WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');");
        System.out.println();
        
        // Additional test passwords
        String[] testPasswords = {"password", "test123", "admin123"};
        System.out.println("=== Additional Test Hashes ===");
        for (String pwd : testPasswords) {
            String hash = encoder.encode(pwd);
            System.out.println("Password: " + pwd);
            System.out.println("Hash: " + hash);
            System.out.println();
        }
    }
}
