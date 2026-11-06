package com.sumpositive.ticketing.ticket.controller;

import com.sumpositive.ticketing.ticket.dto.*;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody CreateTicketRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.getTickets(status, priority, assigneeId, userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.getTicketById(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ticketService.deleteTicket(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}