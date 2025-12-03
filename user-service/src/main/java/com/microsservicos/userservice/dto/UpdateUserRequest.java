package com.microsservicos.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dados para atualização de um usuário (todos os campos são opcionais)")
public class UpdateUserRequest {

    @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
    @Schema(description = "Nome completo do usuário", example = "João Silva Santos", minLength = 2, maxLength = 255)
    private String name;

    @Schema(description = "Telefone do usuário", example = "+55 11 99999-9999")
    private String phone;

    @Schema(description = "Documento de identificação do usuário (CPF, RG, etc.)", example = "123.456.789-00")
    private String document;
}
