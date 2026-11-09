package com.sumpositive.ticketing.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sumpositive.ticketing.auth.dto.AuthResponseDTO;
import com.sumpositive.ticketing.auth.dto.LoginRequestDTO;
import com.sumpositive.ticketing.auth.dto.RegisterRequestDTO;
import com.sumpositive.ticketing.common.exception.ResourceNotFoundException;
import com.sumpositive.ticketing.common.exception.ValidationException;
import com.sumpositive.ticketing.security.JwtService;
import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import com.sumpositive.ticketing.user.entity.User;
import com.sumpositive.ticketing.user.repository.UserRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ValidationException("An account with this email already exists");
        }

        User newUser = new User();
        newUser.setName(request.name().trim());
        newUser.setEmail(normalizedEmail);
        newUser.setPasswordHash(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(newUser);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        UserSummaryDTO userSummary = new UserSummaryDTO(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
        return AuthResponseDTO.of(token, userSummary);
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        String cleanEmail = request.email().trim().toLowerCase();
        log.info("Login attempt for email: '{}'", cleanEmail);

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> {
                    log.error("Login failed: Email '{}' not found in database.", cleanEmail);
                    return new BadCredentialsException("Invalid email or password");
                });

        log.info("Found user in database with id: {}", user.getId());
        
//        log.info("Fresh BCrypt Hash for '{}': {}", request.password(), passwordEncoder.encode(request.password()));
   

        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPasswordHash());
        log.info("Password verification match: {}", passwordMatches);

        if (!passwordMatches) {
            log.error("Login failed: Provided password does not match database hash for '{}'.", cleanEmail);
            throw new BadCredentialsException("Invalid email or password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        UserSummaryDTO userSummary = new UserSummaryDTO(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return AuthResponseDTO.of(token, userSummary);
    }

    @Transactional(readOnly = true)
    public UserSummaryDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return new UserSummaryDTO(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}  