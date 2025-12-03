package com.microsservicos.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dados para definir senha do usuário")
public class SetPasswordRequest {

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    @Schema(description = "Nova senha do usuário (mínimo 6 caracteres)", example = "senha123", requiredMode = Schema.RequiredMode.REQUIRED, minLength = 6)
    private String password;
}
