package com.microsservicos.eventsservice.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_registrations", uniqueConstraints = @UniqueConstraint(columnNames = { "event_id", "user_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Hidden
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, name = "event_id")
    private UUID eventId;

    @Column(nullable = false, name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private LocalDateTime registeredAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean attended = false;

    @Column
    private LocalDateTime attendedAt;

    @Column(nullable = false)
    private String registeredBy;

    @PrePersist
    protected void onCreate() {
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }
}
