package com.microsservicos.userservice.config;

import com.microsservicos.userservice.entity.Role;
import com.microsservicos.userservice.entity.User;
import com.microsservicos.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminUserConfig {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner createAdminUser() {
        return args -> {
            String adminEmail = "admin@email.com";

            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .name("Administrator")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("12345678"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();

                userRepository.save(admin);
                log.info("Default admin user created successfully with email: {}", adminEmail);
            } else {
                log.info("Admin user already exists with email: {}", adminEmail);
            }
        };
    }
}
