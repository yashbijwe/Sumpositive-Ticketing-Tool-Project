package com.sumpositive.ticketing.ticket.controller;

import com.sumpositive.ticketing.common.exception.ErrorResponse;
import com.sumpositive.ticketing.ticket.dto.*;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Endpoints for ticket management, filtering, and status updates")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @Operation(summary = "Create ticket", description = "Creates a new ticket with title, description, priority, and optional assignee")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Ticket created successfully",
                    content = @Content(schema = @Schema(implementation = TicketResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody CreateTicketRequestDTO request) {
        TicketResponseDTO created = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Get tickets", description = "Retrieves tickets with optional filtering by status, priority, and assignee")
    @ApiResponse(responseCode = "200", description = "Tickets retrieved successfully")
    public ResponseEntity<List<TicketResponseDTO>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long assigneeId
    ) {
        return ResponseEntity.ok(ticketService.getTickets(status, priority, assigneeId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID", description = "Retrieves single ticket details")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ticket retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Ticket not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket", description = "Updates title, description, status, priority, assignee, and due date")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ticket updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or invalid assignee ID",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ticket not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequestDTO request
    ) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update ticket status", description = "Transition endpoint used by Kanban board")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid status enum provided",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ticket not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequestDTO request
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ticket", description = "Deletes a ticket by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Ticket deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Ticket not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}