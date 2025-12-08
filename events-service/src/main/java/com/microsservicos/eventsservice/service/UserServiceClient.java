package com.microsservicos.eventsservice.service;

import com.microsservicos.eventsservice.dto.AdminCreateUserRequestDTO;
import com.microsservicos.eventsservice.dto.UserResponseDTO;
import com.microsservicos.eventsservice.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.url:http://177.44.248.107:8080/api}")
    private String userServiceUrl;

    public UserResponseDTO findUserByEmail(String email) {
        HttpHeaders headers = getHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<UserResponseDTO> response = restTemplate.exchange(
                    userServiceUrl + "/admin/users/search?email=" + email,
                    HttpMethod.GET,
                    entity,
                    UserResponseDTO.class);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {
            throw new BusinessException("Erro ao comunicar com o serviço de usuários: " + e.getMessage());
        }
    }

    public UserResponseDTO createUser(String name, String email) {
        HttpHeaders headers = getHeaders();
        AdminCreateUserRequestDTO request = AdminCreateUserRequestDTO.builder()
                .name(name)
                .email(email)
                .build();
        HttpEntity<AdminCreateUserRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<UserResponseDTO> response = restTemplate.exchange(
                    userServiceUrl + "/admin/users",
                    HttpMethod.POST,
                    entity,
                    UserResponseDTO.class);
            return response.getBody();
        } catch (Exception e) {
            throw new BusinessException("Erro ao criar usuário no serviço de usuários: " + e.getMessage());
        }
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Propagate the JWT token
        if (SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwt = (JwtAuthenticationToken) SecurityContextHolder.getContext()
                    .getAuthentication();
            headers.setBearerAuth(jwt.getToken().getTokenValue());
        } else {
            // Fallback or error if not JWT (should be JWT in this context)
            // For now, assuming we are always called in an authenticated context
            // If we were using a service account, we would set that token here.
            // But here we are acting on behalf of the Admin.
            Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();
            if (credentials instanceof String) {
                headers.setBearerAuth((String) credentials);
            }
        }
        return headers;
    }
}
