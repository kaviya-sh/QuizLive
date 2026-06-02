package com.quizlive.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class ResetUserPassword {
    
    private static final String DB_URL = "jdbc:postgresql://ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech/quizlive_prod?sslmode=require";
    private static final String DB_USER = "neondb_owner";
    private static final String DB_PASSWORD = "npg_Wd59yJgvZpXT";
    
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: java ResetUserPassword <email> <new-password>");
            System.out.println("Example: java ResetUserPassword user@example.com newpass123");
            return;
        }
        
        String email = args[0];
        String newPassword = args[1];
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String newHash = encoder.encode(newPassword);
        
        System.out.println("=".repeat(60));
        System.out.println("RESETTING USER PASSWORD");
        System.out.println("=".repeat(60));
        System.out.println("Email: " + email);
        System.out.println("New Password: " + newPassword);
        System.out.println("New Hash: " + newHash);
        System.out.println();
        
        try {
            Class.forName("org.postgresql.Driver");
            
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                System.out.println("✓ Connected to database");
                System.out.println();
                
                // Check if user exists
                String checkSql = "SELECT id, email, display_name, role, deleted FROM users WHERE email = ?";
                try (PreparedStatement stmt = conn.prepareStatement(checkSql)) {
                    stmt.setString(1, email);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (!rs.next()) {
                            System.err.println("✗ User not found: " + email);
                            return;
                        }
                        
                        System.out.println("Found user:");
                        System.out.println("  Email: " + rs.getString("email"));
                        System.out.println("  Name: " + rs.getString("display_name"));
                        System.out.println("  Role: " + rs.getString("role"));
                        System.out.println("  Deleted: " + rs.getBoolean("deleted"));
                        System.out.println();
                    }
                }
                
                // Update password
                String updateSql = "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?";
                try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
                    stmt.setString(1, newHash);
                    stmt.setString(2, email);
                    int updated = stmt.executeUpdate();
                    
                    if (updated > 0) {
                        System.out.println("✓ Password updated successfully!");
                        System.out.println();
                        System.out.println("You can now login with:");
                        System.out.println("  Email: " + email);
                        System.out.println("  Password: " + newPassword);
                    } else {
                        System.err.println("✗ Failed to update password");
                    }
                }
                
                System.out.println("=".repeat(60));
            }
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
