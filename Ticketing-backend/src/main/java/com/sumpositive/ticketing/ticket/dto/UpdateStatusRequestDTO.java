package com.sumpositive.ticketing.ticket.dto;

import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Payload to update ticket status only")
public record UpdateStatusRequestDTO(
        @Schema(description = "New status", example = "IN_PROGRESS")
        @NotNull(message = "Status is required")
        TicketStatus status
) {}