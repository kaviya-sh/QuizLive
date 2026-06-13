package com.quizlive.controller;

import com.quizlive.dto.request.ForgotPasswordRequest;
import com.quizlive.dto.request.LoginRequest;
import com.quizlive.dto.request.RegisterRequest;
import com.quizlive.dto.request.ResetPasswordRequest;
import com.quizlive.dto.response.AuthResponse;
import com.quizlive.service.AuthService;
import com.quizlive.service.PasswordResetService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    
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
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestParam String email) {
        try {
            String message = authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to send OTP"));
        }
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
