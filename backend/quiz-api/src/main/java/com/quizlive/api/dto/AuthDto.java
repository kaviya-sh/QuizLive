package com.quizlive.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank(message = "Display name is required")
        @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters")
        private String displayName;

        @NotBlank(message = "Role is required")
        private String role; // "HOST" or "PARTICIPANT"
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private UserDto user;
    }

    @Data
    public static class UserDto {
        private String id;
        private String email;
        private String displayName;
        private String avatarUrl;
        private String role;
        private String createdAt;
    }

    @Data
    public static class RefreshResponse {
        private String accessToken;
    }
}
