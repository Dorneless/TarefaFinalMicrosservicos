package com.microsservicos.eventsservice.controller;

import com.microsservicos.eventsservice.dto.EventDTO;
import com.microsservicos.eventsservice.dto.EventResponseDTO;
import com.microsservicos.eventsservice.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Eventos", description = "Gerenciamento de eventos")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "Listar todos os eventos ativos")
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Listar eventos futuros")
    public ResponseEntity<List<EventResponseDTO>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar evento por ID")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Criar novo evento (apenas ADMIN)")
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(eventDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Atualizar evento (apenas ADMIN)")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Deletar evento (apenas ADMIN)")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
