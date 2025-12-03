package com.microsservicos.userservice.controller;

import com.microsservicos.userservice.dto.*;
import com.microsservicos.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints para registro e login de usuários")
@SecurityRequirement(name = "") // Endpoints públicos - não requerem autenticação
public class AuthController {

        private final UserService userService;

        @PostMapping("/register")
        @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema. Retorna um token JWT para autenticação.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "409", description = "Email já está em uso", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
                AuthResponse response = userService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PostMapping("/login")
        @Operation(summary = "Fazer login", description = "Autentica um usuário existente usando email e senha. Retorna um token JWT para autenticação.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Credenciais inválidas ou usuário inativo", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
                AuthResponse response = userService.login(request);
                return ResponseEntity.ok(response);
        }

        @PostMapping("/request-code")
        @Operation(summary = "Solicitar código temporário", description = "Envia um código temporário de 6 dígitos para o email do usuário. O código é válido por 15 minutos e pode ser usado para fazer login.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Código enviado com sucesso", content = @Content(schema = @Schema(implementation = MessageResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Usuário inativo", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<MessageResponse> requestCode(@Valid @RequestBody RequestCodeRequest request) {
                MessageResponse response = userService.requestTemporaryCode(request);
                return ResponseEntity.ok(response);
        }

        @PostMapping("/login-with-code")
        @Operation(summary = "Login com código temporário", description = "Autentica um usuário usando o código temporário de 6 dígitos enviado por email. Retorna um token JWT para autenticação.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Código inválido, expirado ou usuário inativo", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<AuthResponse> loginWithCode(@Valid @RequestBody LoginWithCodeRequest request) {
                AuthResponse response = userService.loginWithCode(request);
                return ResponseEntity.ok(response);
        }
}
