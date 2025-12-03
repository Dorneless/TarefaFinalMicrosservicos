package com.microsservicos.userservice.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resposta de erro da API")
public class ErrorResponse {
    
    @Schema(description = "Data e hora em que o erro ocorreu", example = "2024-01-15T10:30:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Código de status HTTP", example = "400")
    private int status;
    
    @Schema(description = "Tipo do erro", example = "Bad Request")
    private String error;
    
    @Schema(description = "Mensagem descritiva do erro", example = "Dados de entrada inválidos")
    private String message;
}


