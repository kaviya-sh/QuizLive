package com.quizlive.controller;

import com.quizlive.dto.request.ForgotPasswordRequest;
import com.quizlive.dto.request.LoginRequest;
import com.quizlive.dto.request.RegisterRequest;
import com.quizlive.dto.request.ResetPasswordRequest;
import com.quizlive.dto.response.AuthResponse;
import com.quizlive.service.AuthService;
import com.quizlive.service.PasswordResetService;
import com.quizlive.repository.UserRepository;
import com.quizlive.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst().orElse(null);
        }
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No refresh token"));
        }
        try {
            Claims claims = jwtUtil.validateToken(refreshToken);
            if (!"REFRESH".equals(claims.get("type", String.class))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token type"));
            }
            UUID userId = UUID.fromString(claims.getSubject());
            var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getDeleted()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Account disabled"));
            }
            String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid or expired refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        // Also clear via header
        response.addHeader("Set-Cookie", 
            "refreshToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None");
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestParam String email) {
        String result = authService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", result));
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        String message = authService.verifyOtp(email, otp);
        return ResponseEntity.ok(Map.of("message", message));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {
        String message = authService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(Map.of("message", message));
    }
    
    @GetMapping("/oauth2/google")
    public void googleLogin(@RequestParam(required = false) String role, HttpServletResponse response) throws IOException {
        String authUrl = authService.getGoogleAuthUrl(role);
        response.sendRedirect(authUrl);
    }
    
    @GetMapping("/oauth2/callback/google")
    public void googleCallback(@RequestParam String code, @RequestParam(required = false) String state, HttpServletResponse response) throws IOException {
        AuthResponse authResponse = authService.handleGoogleCallback(code, state, response);
        String redirectUrl = authService.getFrontendRedirectUrl(authResponse);
        response.sendRedirect(redirectUrl);
    }
}
