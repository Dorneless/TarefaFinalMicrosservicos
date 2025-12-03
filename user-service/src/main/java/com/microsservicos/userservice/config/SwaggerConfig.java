package com.microsservicos.userservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("User Service API")
                                                .version("1.0.0")
                                                .description("API REST para gerenciamento de usuários e autenticação. "
                                                                +
                                                                "Esta API permite registrar novos usuários, fazer login, e gerenciar informações de usuários. "
                                                                +
                                                                "A autenticação é realizada através de JWT Bearer Token.")
                                                .contact(new Contact()
                                                                .name("User Service")
                                                                .email("support@userservice.com"))
                                                .license(new License()
                                                                .name("Apache 2.0")
                                                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                                .components(new Components()
                                                .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")
                                                                .description("Insira o token JWT obtido no endpoint de login ou registro. "
                                                                                +
                                                                                "Formato: Bearer {token}")));
        }

        @Bean
        public GroupedOpenApi publicApi() {
                return GroupedOpenApi.builder()
                                .group("user-service-api")
                                .pathsToMatch("/api/**")
                                .packagesToScan("com.microsservicos.userservice.controller")
                                .build();
        }
}
