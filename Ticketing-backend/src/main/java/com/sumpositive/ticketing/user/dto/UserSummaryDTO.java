package com.sumpositive.ticketing.user.dto;

import com.sumpositive.ticketing.user.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Safe user summary projection for ticket assignment")
public record UserSummaryDTO(
        @Schema(description = "User unique identifier", example = "1")
        Long id,

        @Schema(description = "Full name of the user", example = "Alice Dev")
        String name,

        @Schema(description = "Corporate email address", example = "alice@sumpositive.com")
        String email,
        
        Role role
) {}