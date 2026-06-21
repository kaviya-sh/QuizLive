package com.quizlive.service;

import com.quizlive.dto.request.LoginRequest;
import com.quizlive.dto.request.RegisterRequest;
import com.quizlive.dto.response.AuthResponse;
import com.quizlive.entity.User;
import com.quizlive.exception.ApiException;
import com.quizlive.repository.UserRepository;
import com.quizlive.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${app.google.client-id}")
    private String googleClientId;
    
    @Value("${app.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${app.google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase();
        
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("Email already registered");
        }
        
        log.info("Registering new user: {}", email);
        
        String passwordHash = passwordEncoder.encode(request.getPassword());
        log.info("Password hash generated with prefix: {}", passwordHash.substring(0, 20));
        
        User user = User.builder()
                .email(email)
                .passwordHash(passwordHash)
                .displayName(request.getDisplayName())
                .role(request.getRole())
                .deleted(false)
                .build();
        
        user = userRepository.save(user);
        
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        setRefreshTokenCookie(response, refreshToken);
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(mapToUserDTO(user))
                .build();
    }
    
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword();
        
        log.info("=== LOGIN ATTEMPT ===");
        log.info("Email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found: {}", email);
                    return ApiException.unauthorized("Invalid credentials");
                });
        
        log.info("User found - ID: {}, Role: {}, Deleted: {}", user.getId(), user.getRole(), user.getDeleted());
        
        if (user.getDeleted()) {
            log.error("Account is deleted: {}", email);
            throw ApiException.unauthorized("Account is disabled");
        }
        
        String storedHash = user.getPasswordHash();
        log.info("Hash prefix: {}", storedHash.substring(0, Math.min(20, storedHash.length())));
        
        boolean passwordMatches = passwordEncoder.matches(password, storedHash);
        log.info("Password verification result: {}", passwordMatches);
        
        if (!passwordMatches) {
            log.error("Password mismatch for user: {}", email);
            throw ApiException.unauthorized("Invalid credentials");
        }
        
        log.info("LOGIN SUCCESS for: {}", email);
        log.info("===================");
        
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        setRefreshTokenCookie(response, refreshToken);
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(mapToUserDTO(user))
                .build();
    }
    
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);
    }
    
    private AuthResponse.UserDTO mapToUserDTO(User user) {
        return AuthResponse.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("No account found with this email address"));

        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        log.info("========================================");
        log.info("FORGOT PASSWORD REQUEST");
        log.info("Email: {}", email);
        log.info("Generated OTP: {}", otp);
        log.info("========================================");

        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());
        userRepository.save(user);

        emailService.sendOtp(email, otp);
        
        return "OTP sent successfully. Check server logs if not received.";
    }

    @Transactional(readOnly = true)
    public String verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw ApiException.badRequest("Invalid OTP");
        }

        if (user.getOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("OTP expired");
        }

        return "OTP verified successfully";
    }

    @Transactional
    public String resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw ApiException.badRequest("Invalid OTP");
        }

        if (user.getOtpGeneratedTime().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("OTP expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpGeneratedTime(null);
        userRepository.save(user);

        return "Password reset successful";
    }
    
    public String getGoogleAuthUrl(String role) {
        return UriComponentsBuilder.fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", googleRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("state", role != null ? role : "ROLE_PARTICIPANT")
                .toUriString();
    }
    
    @Transactional
    public AuthResponse handleGoogleCallback(String code, String state, HttpServletResponse response) {
        String accessToken = exchangeCodeForToken(code);
        Map<String, Object> userInfo = getUserInfo(accessToken);
        
        String email = (String) userInfo.get("email");
        String displayName = (String) userInfo.get("name");
        String avatarUrl = (String) userInfo.get("picture");
        String role = state != null ? state : "ROLE_PARTICIPANT";
        
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .displayName(displayName)
                    .avatarUrl(avatarUrl)
                    .role(role)
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .deleted(false)
                    .build();
            return userRepository.save(newUser);
        });
        
        String jwtToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        
        setRefreshTokenCookie(response, refreshToken);
        
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .user(mapToUserDTO(user))
                .build();
    }
    
    private String exchangeCodeForToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        Map<String, String> params = Map.of(
                "code", code,
                "client_id", googleClientId,
                "client_secret", googleClientSecret,
                "redirect_uri", googleRedirectUri,
                "grant_type", "authorization_code"
        );
        
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, params, Map.class);
        return (String) response.getBody().get("access_token");
    }
    
    private Map<String, Object> getUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, Map.class);
        return response.getBody();
    }
    
    public String getFrontendRedirectUrl(AuthResponse authResponse) {
        String path = authResponse.getUser().getRole().equals("ROLE_HOST") ? "/dashboard" : "/join";
        return UriComponentsBuilder.fromHttpUrl(frontendUrl + path)
                .queryParam("token", authResponse.getAccessToken())
                .toUriString();
    }
}
