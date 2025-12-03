package com.microsservicos.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados para login com código temporário")
public class LoginWithCodeRequest {

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Schema(description = "Email do usuário", example = "joao.silva@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Código é obrigatório")
    @Pattern(regexp = "^[0-9]{6}$", message = "Código deve ter 6 dígitos")
    @Schema(description = "Código temporário de 6 dígitos", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED, minLength = 6, maxLength = 6)
    private String code;
}
