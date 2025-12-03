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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

        private final UserService userService;

        @GetMapping("/me")
        @Operation(summary = "Obter usuário atual", description = "Retorna as informações do usuário autenticado atualmente.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Sem permissão", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<UserResponse> getCurrentUser() {
                UserResponse user = userService.getCurrentUser();
                return ResponseEntity.ok(user);
        }

        @PutMapping("/me")
        @Operation(summary = "Atualizar usuário atual", description = "Atualiza as informações do usuário autenticado. Apenas os campos fornecidos serão atualizados.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Sem permissão", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<UserResponse> updateUser(@Valid @RequestBody UpdateUserRequest request) {
                UserResponse user = userService.updateUser(request);
                return ResponseEntity.ok(user);
        }

        @PostMapping("/me/set-password")
        @Operation(summary = "Definir senha", description = "Permite que um usuário sem senha defina sua senha. Disponível apenas para usuários que foram criados por um administrador sem senha.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Senha definida com sucesso", content = @Content(schema = @Schema(implementation = MessageResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Dados inválidos ou senha já definida", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<MessageResponse> setPassword(@Valid @RequestBody SetPasswordRequest request) {
                MessageResponse response = userService.setPassword(request);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Obter usuário por ID", description = "Retorna as informações de um usuário específico pelo seu ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Sem permissão", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
                UserResponse user = userService.getUserById(id);
                return ResponseEntity.ok(user);
        }

        @GetMapping
        @Operation(summary = "Listar todos os usuários", description = "Retorna uma lista com todos os usuários cadastrados no sistema.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso", content = @Content(schema = @Schema(implementation = UserResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Sem permissão", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<List<UserResponse>> listUsers() {
                List<UserResponse> users = userService.listUsers();
                return ResponseEntity.ok(users);
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Excluir usuário", description = "Remove um usuário do sistema pelo seu ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso"),
                        @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Sem permissão", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
        })
        public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
                userService.deleteUser(id);
                return ResponseEntity.noContent().build();
        }
}
