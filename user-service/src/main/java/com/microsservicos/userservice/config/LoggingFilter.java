package com.microsservicos.userservice.config;

import com.microsservicos.userservice.dto.LogDTO;
import com.microsservicos.userservice.service.LogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingFilter extends OncePerRequestFilter {

    private final LogService logService;

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
                // Simplified user extraction
                userEmail = "authenticated_user";
                // Ideally, extract from
                // SecurityContextHolder.getContext().getAuthentication().getName()
                // But let's keep it simple or try to get it if SecurityContext is populated
                if (org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication() != null) {
                    userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext()
                            .getAuthentication().getName();
                }
            }

            String body = new String(request.getContentAsByteArray(), StandardCharsets.UTF_8);
            // Truncate body if too large
            if (body.length() > 1000) {
                body = body.substring(0, 1000) + "...";
            }

            LogDTO logDTO = LogDTO.builder()
                    .userEmail(userEmail)
                    .body(body)
                    .statusCode(statusCode)
                    .method(method)
                    .service("user-service")
                    .ip(ip)
                    .path(path)
                    .build();

            // Execute in a separate thread to avoid blocking response?
            // Or just sync since it's DB insert? Sync is safer for data integrity, async
            // better for perf.
            // Given "LogService" is just a repository save, it's fast enough.
            // But to match previous async behavior:
            // CompletableFuture.runAsync(() -> logService.createLog(logDTO));
            // Let's keep it sync for simplicity unless perf is an issue, or use @Async on
            // service method.
            // I'll use sync for now to ensure it works.

            try {
                logService.createLog(logDTO);
            } catch (Exception e) {
                log.error("Failed to save log: {}", e.getMessage());
            }

        } catch (Exception e) {
            log.error("Error logging request: {}", e.getMessage());
        }
    }
}
