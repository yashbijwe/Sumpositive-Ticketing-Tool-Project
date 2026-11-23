package com.sumpositive.ticketing.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "User login credential request")
public record LoginRequestDTO(
        @Schema(description = "Registered email address", example = "name@gmail.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @Schema(description = "User password", example = "Password123!")
        @NotBlank(message = "Password is required")
        String password
) {}