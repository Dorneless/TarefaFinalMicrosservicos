package com.microsservicos.eventsservice.repository;

import com.microsservicos.eventsservice.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    List<EventRegistration> findByEventId(UUID eventId);

    List<EventRegistration> findByUserId(UUID userId);

    List<EventRegistration> findByUserEmail(String userEmail);

    Optional<EventRegistration> findByEventIdAndUserId(UUID eventId, UUID userId);

    boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

    Optional<EventRegistration> findByEventIdAndUserEmail(UUID eventId, String userEmail);

    long countByEventId(UUID eventId);

    long countByEventIdAndAttendedTrue(UUID eventId);
}
