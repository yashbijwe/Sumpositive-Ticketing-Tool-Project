package com.sumpositive.ticketing.ticket.dto;

import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Payload to create a new ticket")
public record CreateTicketRequestDTO(
        @Schema(description = "Ticket title (3-150 chars)", example = "Implement JWT interceptor")
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
        String title,

        @Schema(description = "Optional detailed description (max 5000 chars)", example = "Add Bearer token to request headers")
        @Size(max = 5000, message = "Description must not exceed 5,000 characters")
        String description,

        @Schema(description = "Initial status (defaults to TO_DO)", example = "TO_DO")
        TicketStatus status,

        @Schema(description = "Initial priority (defaults to MEDIUM)", example = "MEDIUM")
        TicketPriority priority,

        @Schema(description = "Assignee user ID", example = "1")
        Long assigneeId,

        @Schema(description = "Optional due date (ISO 8601 format)", example = "2026-11-15")
        LocalDate dueDate
) {}