package com.microsservicos.eventsservice.controller;

import com.microsservicos.eventsservice.dto.AttendanceDTO;
import com.microsservicos.eventsservice.dto.EventRegistrationDTO;
import com.microsservicos.eventsservice.dto.EventRegistrationResponseDTO;
import com.microsservicos.eventsservice.service.EventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Inscrições em Eventos", description = "Gerenciamento de inscrições em eventos")
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    @PostMapping("/events/{eventId}/register")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Inscrever-se em um evento")
    public ResponseEntity<EventRegistrationResponseDTO> registerToEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody EventRegistrationDTO registrationDTO,
            Authentication authentication) {
        String userEmail = authentication.getName();
        EventRegistrationResponseDTO response = registrationService.registerUserToEvent(
                eventId, registrationDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/events/{eventId}/register-user")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Admin inscrever usuário em evento")
    public ResponseEntity<EventRegistrationResponseDTO> adminRegisterUser(
            @PathVariable UUID eventId,
            @Valid @RequestBody EventRegistrationDTO registrationDTO,
            Authentication authentication) {
        String adminEmail = authentication.getName();
        EventRegistrationResponseDTO response = registrationService.registerUserToEvent(
                eventId, registrationDTO, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Listar inscrições de um evento (apenas ADMIN)")
    public ResponseEntity<List<EventRegistrationResponseDTO>> getEventRegistrations(
            @PathVariable UUID eventId) {
        return ResponseEntity.ok(registrationService.getEventRegistrations(eventId));
    }

    @GetMapping("/my-events")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Listar eventos do usuário autenticado")
    public ResponseEntity<List<EventRegistrationResponseDTO>> getMyEvents(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(registrationService.getUserRegistrations(userEmail));
    }

    @PostMapping("/registrations/{registrationId}/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Registrar presença em evento (apenas ADMIN)")
    public ResponseEntity<EventRegistrationResponseDTO> markAttendance(
            @PathVariable UUID registrationId,
            @Valid @RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(registrationService.markAttendance(registrationId, attendanceDTO));
    }

    @DeleteMapping("/registrations/{registrationId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Cancelar inscrição")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable UUID registrationId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        registrationService.cancelRegistration(registrationId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/registrations/{registrationId}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Admin cancelar inscrição (apenas ADMIN)")
    public ResponseEntity<Void> adminCancelRegistration(@PathVariable UUID registrationId) {
        registrationService.cancelRegistrationByAdmin(registrationId);
        return ResponseEntity.noContent().build();
    }
}
