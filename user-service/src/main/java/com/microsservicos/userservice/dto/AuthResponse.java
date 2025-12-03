package com.microsservicos.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resposta de autenticação contendo o token JWT e informações do usuário")
public class AuthResponse {
    
    @Schema(description = "Token JWT para autenticação nas requisições subsequentes", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "Informações do usuário autenticado")
    private UserResponse user;
}


