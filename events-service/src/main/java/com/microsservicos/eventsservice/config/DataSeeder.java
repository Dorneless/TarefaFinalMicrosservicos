package com.microsservicos.eventsservice.config;

import com.microsservicos.eventsservice.entity.Event;
import com.microsservicos.eventsservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;

    @Override
    public void run(String... args) throws Exception {
        if (eventRepository.count() < 6) {
            List<Event> events = Arrays.asList(
                    Event.builder()
                            .name("Workshop de Microservices com Spring Boot")
                            .description(
                                    "Aprenda a construir arquiteturas escaláveis usando Spring Boot e Spring Cloud. Abordaremos Eureka, Gateway, Config Server e muito mais.")
                            .eventDate(LocalDateTime.now().plusDays(7).withHour(14).withMinute(0))
                            .location("Auditório Principal - Tech Hub")
                            .maxCapacity(50)
                            .active(true)
                            .build(),
                    Event.builder()
                            .name("React e Next.js: Do Zero ao Profissional")
                            .description(
                                    "Domine o desenvolvimento frontend moderno com React e Next.js. Construa aplicações performáticas e otimizadas para SEO.")
                            .eventDate(LocalDateTime.now().plusDays(14).withHour(10).withMinute(0))
                            .location("Sala de Treinamento 1")
                            .maxCapacity(30)
                            .active(true)
                            .build(),
                    Event.builder()
                            .name("Introdução a Kubernetes e Docker")
                            .description(
                                    "Entenda os conceitos fundamentais de containerização e orquestração. Aprenda a criar Dockerfiles e deploys no K8s.")
                            .eventDate(LocalDateTime.now().plusDays(21).withHour(19).withMinute(0))
                            .location("Online (Zoom)")
                            .maxCapacity(100)
                            .active(true)
                            .build(),
                    Event.builder()
                            .name("Design System na Prática")
                            .description(
                                    "Como criar e manter um Design System eficiente para seus produtos digitais. Ferramentas, tokens e documentação.")
                            .eventDate(LocalDateTime.now().plusDays(10).withHour(15).withMinute(30))
                            .location("Espaço Criativo")
                            .maxCapacity(40)
                            .active(true)
                            .build(),
                    Event.builder()
                            .name("Segurança em Aplicações Web")
                            .description(
                                    "Melhores práticas para proteger suas aplicações contra vulnerabilidades comuns (OWASP Top 10).")
                            .eventDate(LocalDateTime.now().plusDays(30).withHour(18).withMinute(0))
                            .location("Auditório B")
                            .maxCapacity(60)
                            .active(true)
                            .build(),
                    Event.builder()
                            .name("Inteligência Artificial para Desenvolvedores")
                            .description(
                                    "Explore como integrar IA em seus projetos de software. Uso de LLMs, APIs da OpenAI e LangChain.")
                            .eventDate(LocalDateTime.now().plusDays(45).withHour(9).withMinute(0))
                            .location("Centro de Convenções")
                            .maxCapacity(200)
                            .active(true)
                            .build());

            eventRepository.saveAll(events);
            System.out.println("DataSeeder: 6 initial events created.");
        }
    }
}
