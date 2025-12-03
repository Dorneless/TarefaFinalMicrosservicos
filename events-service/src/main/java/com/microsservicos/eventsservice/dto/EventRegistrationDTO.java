package com.microsservicos.eventsservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistrationDTO {

    @NotNull(message = "ID do usuário é obrigatório")
    private UUID userId;

    @NotBlank(message = "Email do usuário é obrigatório")
    private String userEmail;

    @NotBlank(message = "Nome do usuário é obrigatório")
    private String userName;
}
