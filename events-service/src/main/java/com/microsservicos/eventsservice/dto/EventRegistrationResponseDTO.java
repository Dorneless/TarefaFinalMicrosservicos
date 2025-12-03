package com.microsservicos.eventsservice.dto;

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
public class EventRegistrationResponseDTO {

    private UUID id;
    private UUID eventId;
    private String eventName;
    private UUID userId;
    private String userEmail;
    private String userName;
    private LocalDateTime registeredAt;
    private Boolean attended;
    private LocalDateTime attendedAt;
    private String registeredBy;
}
