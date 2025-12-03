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
public class EventResponseDTO {

    private UUID id;
    private String name;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private Integer maxCapacity;
    private Long registeredCount;
    private Long attendedCount;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
