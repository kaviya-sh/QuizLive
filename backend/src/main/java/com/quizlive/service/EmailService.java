package com.quizlive.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    @Value("${spring.mail.from:noreply@sparklo.in}")
    private String fromAddress;

    public void sendOtp(String toEmail, String otp) {
        log.info("=== SENDGRID EMAIL DEBUG ===");
        log.info("Sending OTP to: {}", toEmail);
        log.info("OTP: {}", otp);
        log.info("SendGrid API Key configured: {}", sendGridApiKey != null && !sendGridApiKey.isEmpty());
        log.info("From address: {}", fromAddress);
        
        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            log.error("SendGrid API key not configured - OTP cannot be sent");
            return;
        }
        
        try {
            Email from = new Email(fromAddress);
            Email to = new Email(toEmail);
            String subject = "Sparklo Password Reset OTP";
            
            String emailBody = "Hello,\n\n" +
                    "Your OTP for password reset is: " + otp + "\n\n" +
                    "This OTP is valid for 5 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Sparklo.in Team";
            
            Content content = new Content("text/plain", emailBody);
            Mail mail = new Mail(from, subject, to, content);
            
            log.info("Calling SendGrid API...");
            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            
            log.info("SendGrid response code: {}", response.getStatusCode());
            log.info("SendGrid response body: {}", response.getBody());
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("✓ OTP sent successfully via SendGrid to: {}", toEmail);
            } else {
                log.error("✗ SendGrid error code {}: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("✗ Exception sending OTP via SendGrid: {}", e.getMessage(), e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        log.info("Password reset for: {}", toEmail);
    }
}
