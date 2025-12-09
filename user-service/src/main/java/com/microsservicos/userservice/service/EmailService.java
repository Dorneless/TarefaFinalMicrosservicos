package com.microsservicos.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @org.springframework.beans.factory.annotation.Value("${notification.service.url:http://localhost:8082/api}")
    private String notificationServiceUrl;

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    /**
     * Envia um código temporário por email via notification-service.
     * 
     * @param email Email do destinatário
     * @param code  Código temporário de 6 dígitos
     */
    public void sendTemporaryCode(String email, String code) {
        log.info("Sending temporary code to {}", email);

        try {
            java.util.Map<String, Object> request = new java.util.HashMap<>();
            request.put("email", email);
            request.put("code", code);
            request.put("expirationMinutes", 15);

            String url = notificationServiceUrl + "/notifications/temporary-code";
            restTemplate.postForObject(url, request, String.class);

            log.info("Temporary code email request sent to notification-service");
        } catch (Exception e) {
            log.error("Failed to send temporary code email to {}: {}", email, e.getMessage());
            // We might not want to throw exception here to avoid breaking the flow if email
            // service is down,
            // but it depends on requirements. For now, we log error.
        }
    }
}
