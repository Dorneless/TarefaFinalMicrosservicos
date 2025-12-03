package com.microsservicos.userservice.controller;

import com.microsservicos.userservice.dto.AdminCreateUserRequest;
import com.microsservicos.userservice.dto.UserResponse;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administração", description = "Endpoints para operações administrativas (apenas ADMIN)")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final UserService userService;

    @PostMapping("/users")
    @Operation(summary = "Criar usuário sem senha (Admin)", description = "Permite que um administrador crie um novo usuário com apenas nome e email. "
            +
            "O usuário criado não terá senha e deverá usar código temporário para fazer login pela primeira vez.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso", content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Sem permissão (apenas ADMIN)", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email já está em uso", content = @Content(schema = @Schema(implementation = com.microsservicos.userservice.exception.ErrorResponse.class)))
    })
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        UserResponse response = userService.adminCreateUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
