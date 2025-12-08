package com.microsservicos.eventsservice.config;

import com.microsservicos.eventsservice.dto.LogDTO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class LoggingFilter extends OncePerRequestFilter {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            logRequest(requestWrapper, responseWrapper);
            responseWrapper.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response) {
        try {
            String method = request.getMethod();
            String path = request.getRequestURI();
            int statusCode = response.getStatus();
            String ip = request.getRemoteAddr();
            String userEmail = "anonymous";

            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                userEmail = "authenticated_user";
                if (org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication() != null) {
                    userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext()
                            .getAuthentication().getName();
                }
            }

            String body = new String(request.getContentAsByteArray(), StandardCharsets.UTF_8);
            if (body.length() > 1000) {
                body = body.substring(0, 1000) + "...";
            }

            LogDTO logDTO = LogDTO.builder()
                    .userEmail(userEmail)
                    .body(body)
                    .statusCode(statusCode)
                    .method(method)
                    .service("events-service")
                    .ip(ip)
                    .path(path)
                    .build();

            new Thread(() -> {
                try {
                    restTemplate.postForObject("http://177.44.248.107:8084/logs", logDTO, String.class);
                } catch (Exception e) {
                    log.error("Failed to send log: {}", e.getMessage());
                }
            }).start();

        } catch (Exception e) {
            log.error("Error logging request: {}", e.getMessage());
        }
    }
}
