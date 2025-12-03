package com.microsservicos.userservice.dto;

import com.microsservicos.userservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Informações de um usuário")
public class UserResponse {
    
    @Schema(description = "ID único do usuário", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;
    
    @Schema(description = "Nome completo do usuário", example = "João Silva")
    private String name;
    
    @Schema(description = "Email do usuário", example = "joao.silva@example.com")
    private String email;
    
    @Schema(description = "Telefone do usuário", example = "+55 11 99999-9999")
    private String phone;
    
    @Schema(description = "Documento de identificação do usuário", example = "123.456.789-00")
    private String document;
    
    @Schema(description = "Papel do usuário no sistema", example = "USER", allowableValues = {"USER", "ADMIN"})
    private Role role;
    
    @Schema(description = "Data e hora de criação do usuário", example = "2024-01-15T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Data e hora da última atualização do usuário", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Indica se o usuário está ativo", example = "true")
    private Boolean active;
}


