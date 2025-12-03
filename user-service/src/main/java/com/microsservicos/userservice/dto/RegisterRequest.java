package com.microsservicos.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados necessários para registro de um novo usuário")
public class RegisterRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
    @Schema(description = "Nome completo do usuário", example = "João Silva", requiredMode = Schema.RequiredMode.REQUIRED, minLength = 2, maxLength = 255)
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Schema(description = "Email do usuário (deve ser único)", example = "joao.silva@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    @Schema(description = "Senha do usuário (mínimo 6 caracteres)", example = "senha123", requiredMode = Schema.RequiredMode.REQUIRED, minLength = 6)
    private String password;

    @Schema(description = "Telefone do usuário", example = "+55 11 99999-9999")
    private String phone;

    @Schema(description = "Documento de identificação do usuário (CPF, RG, etc.)", example = "123.456.789-00")
    private String document;
}
