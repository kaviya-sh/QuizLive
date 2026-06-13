package com.quizlive.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.from:${spring.mail.username:noreply@quizlive.com}}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        if (mailSender == null) {
            log.warn("Mail sender not configured. Skipping password reset email to: {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Sparklo.in");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String emailBody = "Hello,\n\n" +
                    "You have requested to reset your password for your Sparklo.in account.\n\n" +
                    "Please click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request this password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Sparklo.in Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
        }
    }

    public void sendOtp(String toEmail, String otp) {
        if (mailSender == null) {
            log.error("Mail sender not configured. Cannot send OTP email to: {}", toEmail);
            log.warn("OTP for {} is: {} (logged because mail sender is not configured)", toEmail, otp);
            throw new RuntimeException("Email service is not configured. Please contact support.");
        }
        try {
            log.info("Attempting to send OTP to: {}", toEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Sparklo Password Reset OTP");
            
            String emailBody = "Hello,\n\n" +
                    "Your OTP for password reset is: " + otp + "\n\n" +
                    "This OTP is valid for 5 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Sparklo.in Team";
            
            message.setText(emailBody);
            mailSender.send(message);
            
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage(), e);
            log.warn("OTP for {} is: {} (logged due to email send failure)", toEmail, otp);
            throw new RuntimeException("Failed to send email. The OTP has been logged in server logs. Please check with administrator or try again later.");
        }
    }
}
