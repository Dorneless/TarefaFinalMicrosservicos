package com.microsservicos.userservice.service;

import com.microsservicos.userservice.dto.*;
import com.microsservicos.userservice.entity.Role;
import com.microsservicos.userservice.entity.User;
import com.microsservicos.userservice.exception.*;
import com.microsservicos.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email já existe: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .document(request.getDocument())
                .role(Role.USER)
                .active(true)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou senha inválidos"));

        if (!user.getActive()) {
            throw new InvalidCredentialsException("Conta de usuário inativa");
        }

        // Verificar se usuário tem senha definida
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new PasswordRequiredException(
                    "Esta conta não possui senha definida. Por favor, solicite um código temporário para fazer login.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Email ou senha inválidos");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser() {
        User user = getAuthenticatedUser();
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UpdateUserRequest request) {
        User user = getAuthenticatedUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getDocument() != null) {
            user.setDocument(request.getDocument());
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com id: " + id));

        User currentUser = getAuthenticatedUser();

        // Usuário pode ver seu próprio perfil ou admin pode ver qualquer perfil
        if (!currentUser.getId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Você não tem permissão para visualizar este usuário");
        }

        return mapToUserResponse(user);
    }

    public List<UserResponse> listUsers() {
        User currentUser = getAuthenticatedUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Apenas administradores podem listar todos os usuários");
        }

        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(UUID id) {
        User currentUser = getAuthenticatedUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Apenas administradores podem excluir usuários");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com id: " + id));

        // Soft delete
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse adminCreateUser(AdminCreateUserRequest request) {
        User currentUser = getAuthenticatedUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Apenas administradores podem criar usuários");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email já existe: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(null) // Sem senha inicial
                .role(Role.USER)
                .active(true)
                .build();

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public MessageResponse requestTemporaryCode(RequestCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new UserNotFoundException("Usuário não encontrado com email: " + request.getEmail()));

        if (!user.getActive()) {
            throw new InvalidCredentialsException("Conta de usuário inativa");
        }

        // Gerar código de 6 dígitos
        String code = generateSixDigitCode();

        // Invalidar código anterior e definir novo código com expiração de 15 minutos
        user.setTemporaryCode(code);
        user.setTemporaryCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Enviar código por email
        emailService.sendTemporaryCode(user.getEmail(), code);

        return MessageResponse.builder()
                .message("Código temporário enviado para seu email. Válido por 15 minutos.")
                .build();
    }

    @Transactional
    public AuthResponse loginWithCode(LoginWithCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou código inválidos"));

        if (!user.getActive()) {
            throw new InvalidCredentialsException("Conta de usuário inativa");
        }

        // Verificar se há código temporário
        if (user.getTemporaryCode() == null || user.getTemporaryCodeExpiresAt() == null) {
            throw new InvalidCodeException("Nenhum código temporário encontrado. Por favor, solicite um novo código.");
        }

        // Verificar se código expirou
        if (LocalDateTime.now().isAfter(user.getTemporaryCodeExpiresAt())) {
            throw new InvalidCodeException("Código temporário expirado. Por favor, solicite um novo código.");
        }

        // Verificar se código está correto
        if (!user.getTemporaryCode().equals(request.getCode())) {
            throw new InvalidCodeException("Código inválido. Por favor, verifique e tente novamente.");
        }

        // Invalidar código após uso
        user.setTemporaryCode(null);
        user.setTemporaryCodeExpiresAt(null);
        userRepository.save(user);

        // Gerar token JWT
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public MessageResponse setPassword(SetPasswordRequest request) {
        User user = getAuthenticatedUser();

        // Verificar se usuário já tem senha (opcional: permitir troca de senha)
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            throw new PasswordAlreadySetException(
                    "Senha já está definida. Use o endpoint de alteração de senha para atualizá-la.");
        }

        // Definir senha
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return MessageResponse.builder()
                .message("Senha definida com sucesso. Agora você pode fazer login com seu email e senha.")
                .build();
    }

    private String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com email: " + email));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .document(user.getDocument())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .active(user.getActive())
                .build();
    }

    public UserResponse findByEmail(String email) {
        User currentUser = getAuthenticatedUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Apenas administradores podem buscar usuários por email");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com email: " + email));

        return mapToUserResponse(user);
    }
}
