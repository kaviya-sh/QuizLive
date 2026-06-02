package com.quizlive.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class FixProductionUsers {
    
    private static final String DB_URL = "jdbc:postgresql://ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech/quizlive_prod?sslmode=require";
    private static final String DB_USER = "neondb_owner";
    private static final String DB_PASSWORD = "npg_Wd59yJgvZpXT";
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String correctHash = "$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2";
        
        System.out.println("=".repeat(60));
        System.out.println("FIXING PRODUCTION DATABASE USERS");
        System.out.println("=".repeat(60));
        System.out.println("Database: " + DB_URL);
        System.out.println("Correct hash for 'demo123': " + correctHash);
        System.out.println();
        
        try {
            // Load PostgreSQL driver
            Class.forName("org.postgresql.Driver");
            
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                System.out.println("✓ Connected to database successfully!");
                System.out.println();
                
                // Check existing users
                System.out.println("--- CHECKING EXISTING USERS ---");
                String checkSql = "SELECT id, email, display_name, role, deleted, " +
                                "substring(password_hash, 1, 30) as hash_prefix " +
                                "FROM users WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in')";
                
                try (PreparedStatement stmt = conn.prepareStatement(checkSql);
                     ResultSet rs = stmt.executeQuery()) {
                    
                    boolean foundUsers = false;
                    while (rs.next()) {
                        foundUsers = true;
                        System.out.println("Found user:");
                        System.out.println("  Email: " + rs.getString("email"));
                        System.out.println("  Name: " + rs.getString("display_name"));
                        System.out.println("  Role: " + rs.getString("role"));
                        System.out.println("  Deleted: " + rs.getBoolean("deleted"));
                        System.out.println("  Hash prefix: " + rs.getString("hash_prefix"));
                        System.out.println();
                    }
                    
                    if (!foundUsers) {
                        System.out.println("No demo users found in database.");
                        System.out.println();
                    }
                }
                
                // Fix/Insert users
                System.out.println("--- FIXING USERS ---");
                String upsertSql = "INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at, deleted) " +
                                 "VALUES (?, ?, ?, ?, NOW(), NOW(), false) " +
                                 "ON CONFLICT (email) DO UPDATE SET " +
                                 "password_hash = EXCLUDED.password_hash, " +
                                 "display_name = EXCLUDED.display_name, " +
                                 "role = EXCLUDED.role, " +
                                 "deleted = false, " +
                                 "updated_at = NOW()";
                
                try (PreparedStatement stmt = conn.prepareStatement(upsertSql)) {
                    // Demo participant
                    stmt.setString(1, "demo@sparklo.in");
                    stmt.setString(2, correctHash);
                    stmt.setString(3, "Demo Participant");
                    stmt.setString(4, "ROLE_PARTICIPANT");
                    stmt.executeUpdate();
                    System.out.println("✓ Fixed/Created: demo@sparklo.in");
                    
                    // Demo host
                    stmt.setString(1, "demohost@sparklo.in");
                    stmt.setString(2, correctHash);
                    stmt.setString(3, "Demo Host");
                    stmt.setString(4, "ROLE_HOST");
                    stmt.executeUpdate();
                    System.out.println("✓ Fixed/Created: demohost@sparklo.in");
                }
                
                System.out.println();
                System.out.println("--- VERIFICATION ---");
                
                // Verify fix
                try (PreparedStatement stmt = conn.prepareStatement(checkSql);
                     ResultSet rs = stmt.executeQuery()) {
                    
                    while (rs.next()) {
                        String email = rs.getString("email");
                        String hashPrefix = rs.getString("hash_prefix");
                        boolean hashMatches = hashPrefix.equals(correctHash.substring(0, 30));
                        
                        System.out.println("User: " + email);
                        System.out.println("  Role: " + rs.getString("role"));
                        System.out.println("  Deleted: " + rs.getBoolean("deleted"));
                        System.out.println("  Hash matches: " + (hashMatches ? "✓ YES" : "✗ NO"));
                        System.out.println();
                    }
                }
                
                System.out.println("=".repeat(60));
                System.out.println("SUCCESS! Users are now fixed.");
                System.out.println("You can now login with:");
                System.out.println("  Email: demo@sparklo.in or demohost@sparklo.in");
                System.out.println("  Password: demo123");
                System.out.println("=".repeat(60));
            }
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
