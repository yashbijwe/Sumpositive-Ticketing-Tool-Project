package com.sumpositive.ticketing.ticket.dto;

import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Payload to update an existing ticket")
public record UpdateTicketRequestDTO(
        @Schema(description = "Ticket title", example = "Updated ticket title")
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
        String title,

        @Schema(description = "Ticket description", example = "Updated description")
        @Size(max = 5000, message = "Description must not exceed 5,000 characters")
        String description,

        @Schema(description = "Ticket status", example = "IN_PROGRESS")
        @NotNull(message = "Status is required")
        TicketStatus status,

        @Schema(description = "Ticket priority", example = "HIGH")
        @NotNull(message = "Priority is required")
        TicketPriority priority,

        @Schema(description = "Assignee user ID (can be null to unassign)", example = "2")
        Long assigneeId,

        @Schema(description = "Due date", example = "2026-11-20")
        LocalDate dueDate
) {}