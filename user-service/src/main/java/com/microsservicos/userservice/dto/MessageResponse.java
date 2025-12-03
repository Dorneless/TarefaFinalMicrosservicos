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
@Schema(description = "Resposta genérica com mensagem")
public class MessageResponse {

    @Schema(description = "Mensagem de resposta", example = "Operação realizada com sucesso")
    private String message;
}
