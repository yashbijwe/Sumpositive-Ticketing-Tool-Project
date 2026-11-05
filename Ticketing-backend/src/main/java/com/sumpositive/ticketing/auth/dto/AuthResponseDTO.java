package com.sumpositive.ticketing.auth.dto;

import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response with signed JWT")
public record AuthResponseDTO(
        @Schema(description = "Signed JWT token")
        String token,

        @Schema(description = "Token type", example = "Bearer")
        String tokenType,

        @Schema(description = "Authenticated user profile")
        UserSummaryDTO user
) {
    public static AuthResponseDTO of(String token, UserSummaryDTO user) {
        return new AuthResponseDTO(token, "Bearer", user);
    }
}