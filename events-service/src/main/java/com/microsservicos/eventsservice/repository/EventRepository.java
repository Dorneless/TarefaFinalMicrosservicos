package com.microsservicos.eventsservice.repository;

import com.microsservicos.eventsservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByActiveTrue();

    @Query("SELECT e FROM Event e WHERE e.active = true AND e.eventDate >= :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(LocalDateTime now);

    @Query("SELECT e FROM Event e WHERE e.active = true ORDER BY e.eventDate DESC")
    List<Event> findAllActiveOrderByDateDesc();
}
