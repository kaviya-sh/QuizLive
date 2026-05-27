package com.quizlive.controller;

import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class SystemHealthController {
    
    private final DataSource dataSource;
    private final RedisTemplate<String, Object> redisTemplate;
    private final MinioClient minioClient;
    
    @GetMapping("/check")
    public Map<String, Object> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        // Check PostgreSQL
        try (Connection conn = dataSource.getConnection()) {
            health.put("database", Map.of(
                "status", "UP",
                "type", "PostgreSQL"
            ));
        } catch (Exception e) {
            health.put("database", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }
        
        // Check Redis
        try {
            redisTemplate.opsForValue().set("health:check", "ok");
            String value = (String) redisTemplate.opsForValue().get("health:check");
            health.put("redis", Map.of(
                "status", "ok".equals(value) ? "UP" : "DOWN"
            ));
        } catch (Exception e) {
            health.put("redis", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }
        
        // Check MinIO
        try {
            minioClient.listBuckets();
            health.put("minio", Map.of(
                "status", "UP"
            ));
        } catch (Exception e) {
            health.put("minio", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }
        
        health.put("overall", "UP");
        return health;
    }
}
