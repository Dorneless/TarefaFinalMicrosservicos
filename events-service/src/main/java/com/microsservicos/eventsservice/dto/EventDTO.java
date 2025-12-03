package com.microsservicos.eventsservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {

    @NotBlank(message = "Nome do evento é obrigatório")
    private String name;

    private String description;

    @NotNull(message = "Data do evento é obrigatória")
    private LocalDateTime eventDate;

    private String location;

    private Integer maxCapacity;
}
