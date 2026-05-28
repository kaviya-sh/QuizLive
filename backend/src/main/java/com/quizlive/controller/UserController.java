package com.quizlive.controller;

import com.quizlive.entity.User;
import com.quizlive.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user,
                                             @RequestBody UpdateProfileRequest request) {
        User updated = userService.updateProfile(user.getId(), request.getDisplayName(), request.getEmail());
        return ResponseEntity.ok(updated);
    }

    @Data
    public static class UpdateProfileRequest {
        private String displayName;
        private String email;
    }
}
