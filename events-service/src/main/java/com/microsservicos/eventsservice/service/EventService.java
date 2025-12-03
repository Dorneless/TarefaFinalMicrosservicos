package com.microsservicos.eventsservice.service;

import com.microsservicos.eventsservice.dto.EventDTO;
import com.microsservicos.eventsservice.dto.EventResponseDTO;
import com.microsservicos.eventsservice.entity.Event;
import com.microsservicos.eventsservice.exception.ResourceNotFoundException;
import com.microsservicos.eventsservice.repository.EventRegistrationRepository;
import com.microsservicos.eventsservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAllActiveOrderByDateDesc().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));
        return convertToResponseDTO(event);
    }

    @Transactional
    public EventResponseDTO createEvent(EventDTO eventDTO) {
        Event event = Event.builder()
                .name(eventDTO.getName())
                .description(eventDTO.getDescription())
                .eventDate(eventDTO.getEventDate())
                .location(eventDTO.getLocation())
                .maxCapacity(eventDTO.getMaxCapacity())
                .active(true)
                .build();

        Event savedEvent = eventRepository.save(event);
        return convertToResponseDTO(savedEvent);
    }

    @Transactional
    public EventResponseDTO updateEvent(UUID id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));

        event.setName(eventDTO.getName());
        event.setDescription(eventDTO.getDescription());
        event.setEventDate(eventDTO.getEventDate());
        event.setLocation(eventDTO.getLocation());
        event.setMaxCapacity(eventDTO.getMaxCapacity());

        Event updatedEvent = eventRepository.save(event);
        return convertToResponseDTO(updatedEvent);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));
        event.setActive(false);
        eventRepository.save(event);
    }

    private EventResponseDTO convertToResponseDTO(Event event) {
        long registeredCount = registrationRepository.countByEventId(event.getId());
        long attendedCount = registrationRepository.countByEventIdAndAttendedTrue(event.getId());

        return EventResponseDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .maxCapacity(event.getMaxCapacity())
                .registeredCount(registeredCount)
                .attendedCount(attendedCount)
                .active(event.getActive())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
