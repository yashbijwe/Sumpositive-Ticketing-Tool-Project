package com.sumpositive.ticketing.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standardized error response payload")
public record ErrorResponse(
        @Schema(description = "UTC timestamp when the error occurred", example = "2026-11-03T05:00:00Z")
        Instant timestamp,

        @Schema(description = "HTTP status code", example = "400")
        int status,

        @Schema(description = "Error categorization code", example = "VALIDATION_ERROR")
        String code,

        @Schema(description = "Human-readable error description", example = "Input validation failed")
        String message,

        @Schema(description = "Map of field-level validation errors, if applicable")
        Map<String, String> fieldErrors
) {
    public static ErrorResponse of(int status, String code, String message) {
        return new ErrorResponse(Instant.now(), status, code, message, null);
    }

    public static ErrorResponse of(int status, String code, String message, Map<String, String> fieldErrors) {
        return new ErrorResponse(Instant.now(), status, code, message, fieldErrors);
    }
}