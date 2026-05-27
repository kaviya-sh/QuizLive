package com.quizlive.api.auth;

import com.quizlive.api.dto.AuthDto;
import com.quizlive.api.service.TokenBlacklistService;
import com.quizlive.core.entity.User;
import com.quizlive.core.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService blacklistService;

    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Email already exists"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName());
        user.setProvider("local");
        
        try {
            user.setRole(User.UserRole.valueOf("ROLE_" + request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid role. Must be HOST or PARTICIPANT"));
        }

        user = userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        setRefreshTokenCookie(response, refreshToken);

        AuthDto.AuthResponse authResponse = new AuthDto.AuthResponse();
        authResponse.setAccessToken(accessToken);
        authResponse.setUser(mapToUserDto(user));

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        setRefreshTokenCookie(response, refreshToken);

        AuthDto.AuthResponse authResponse = new AuthDto.AuthResponse();
        authResponse.setAccessToken(accessToken);
        authResponse.setUser(mapToUserDto(user));

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !tokenProvider.validateToken(refreshToken) || tokenProvider.isTokenExpired(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid or expired refresh token"));
        }

        if (blacklistService.isBlacklisted(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token has been revoked"));
        }

        UUID userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not found"));
        }

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthDto.RefreshResponse refreshResponse = new AuthDto.RefreshResponse();
        refreshResponse.setAccessToken(newAccessToken);

        return ResponseEntity.ok(refreshResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken != null) {
            blacklistService.blacklistToken(refreshToken, 7 * 24 * 60 * 60 * 1000L); // 7 days
        }

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(REFRESH_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    private AuthDto.UserDto mapToUserDto(User user) {
        AuthDto.UserDto dto = new AuthDto.UserDto();
        dto.setId(user.getId().toString());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRole(user.getRole().name().replace("ROLE_", ""));
        dto.setCreatedAt(user.getCreatedAt().toString());
        return dto;
    }

    record ErrorResponse(String message) {}
    record MessageResponse(String message) {}
}
