package com.microsservicos.eventsservice.service;

import com.microsservicos.eventsservice.dto.AttendanceDTO;
import com.microsservicos.eventsservice.dto.EventRegistrationDTO;
import com.microsservicos.eventsservice.dto.EventRegistrationResponseDTO;
import com.microsservicos.eventsservice.entity.Event;
import com.microsservicos.eventsservice.entity.EventRegistration;
import com.microsservicos.eventsservice.exception.BusinessException;
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
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;

    @Transactional
    public EventRegistrationResponseDTO registerUserToEvent(UUID eventId, EventRegistrationDTO registrationDTO,
            String registeredByEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + eventId));

        if (!event.getActive()) {
            throw new BusinessException("Não é possível se inscrever em um evento inativo");
        }

        if (registrationRepository.existsByEventIdAndUserId(eventId, registrationDTO.getUserId())) {
            throw new BusinessException("Usuário já está inscrito neste evento");
        }

        if (event.getMaxCapacity() != null) {
            long currentRegistrations = registrationRepository.countByEventId(eventId);
            if (currentRegistrations >= event.getMaxCapacity()) {
                throw new BusinessException("Evento já atingiu a capacidade máxima de inscrições");
            }
        }

        EventRegistration registration = EventRegistration.builder()
                .eventId(eventId)
                .userId(registrationDTO.getUserId())
                .userEmail(registrationDTO.getUserEmail())
                .userName(registrationDTO.getUserName())
                .registeredAt(LocalDateTime.now())
                .attended(false)
                .registeredBy(registeredByEmail)
                .build();

        EventRegistration savedRegistration = registrationRepository.save(registration);
        return convertToResponseDTO(savedRegistration, event);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponseDTO> getEventRegistrations(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + eventId));

        return registrationRepository.findByEventId(eventId).stream()
                .map(reg -> convertToResponseDTO(reg, event))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponseDTO> getUserRegistrations(String userEmail) {
        List<EventRegistration> registrations = registrationRepository.findByUserEmail(userEmail);

        return registrations.stream()
                .map(reg -> {
                    Event event = eventRepository.findById(reg.getEventId())
                            .orElse(null);
                    return convertToResponseDTO(reg, event);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public EventRegistrationResponseDTO markAttendance(UUID registrationId, AttendanceDTO attendanceDTO) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscrição não encontrada com ID: " + registrationId));

        registration.setAttended(attendanceDTO.getAttended());
        if (attendanceDTO.getAttended()) {
            registration.setAttendedAt(LocalDateTime.now());
        } else {
            registration.setAttendedAt(null);
        }

        EventRegistration updatedRegistration = registrationRepository.save(registration);
        Event event = eventRepository.findById(updatedRegistration.getEventId()).orElse(null);
        return convertToResponseDTO(updatedRegistration, event);
    }

    @Transactional
    public void cancelRegistration(UUID registrationId, String userEmail) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscrição não encontrada com ID: " + registrationId));

        if (!registration.getUserEmail().equals(userEmail)) {
            throw new BusinessException("Você não tem permissão para cancelar esta inscrição");
        }

        registrationRepository.delete(registration);
    }

    @Transactional
    public void cancelRegistrationByAdmin(UUID registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscrição não encontrada com ID: " + registrationId));

        registrationRepository.delete(registration);
    }

    private EventRegistrationResponseDTO convertToResponseDTO(EventRegistration registration, Event event) {
        return EventRegistrationResponseDTO.builder()
                .id(registration.getId())
                .eventId(registration.getEventId())
                .eventName(event != null ? event.getName() : null)
                .userId(registration.getUserId())
                .userEmail(registration.getUserEmail())
                .userName(registration.getUserName())
                .registeredAt(registration.getRegisteredAt())
                .attended(registration.getAttended())
                .attendedAt(registration.getAttendedAt())
                .registeredBy(registration.getRegisteredBy())
                .build();
    }
}
