package com.sumpositive.ticketing.ticket.service;

import com.sumpositive.ticketing.common.exception.ResourceNotFoundException;
import com.sumpositive.ticketing.common.exception.ValidationException;
import com.sumpositive.ticketing.ticket.dto.*;
import com.sumpositive.ticketing.ticket.entity.Ticket;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.mapper.TicketMapper;
import com.sumpositive.ticketing.ticket.repository.TicketRepository;
import com.sumpositive.ticketing.user.entity.User;
import com.sumpositive.ticketing.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository, TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketMapper = ticketMapper;
    }

    @Transactional
    public TicketResponseDTO createTicket(CreateTicketRequestDTO request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description() != null ? request.description().trim() : null);
        ticket.setStatus(request.status() != null ? request.status() : TicketStatus.TO_DO);
        ticket.setPriority(request.priority() != null ? request.priority() : TicketPriority.MEDIUM);
        ticket.setDueDate(request.dueDate());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ValidationException("Assignee not found with ID: " + request.assigneeId()));
            ticket.setAssignee(assignee);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponseDTO(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTickets(TicketStatus status, TicketPriority priority, Long assigneeId) {
        Specification<Ticket> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ticketRepository.findAll(spec).stream()
                .map(ticketMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        return ticketMapper.toResponseDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO updateTicket(Long id, UpdateTicketRequestDTO request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description() != null ? request.description().trim() : null);
        ticket.setStatus(request.status());
        ticket.setPriority(request.priority());
        ticket.setDueDate(request.dueDate());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ValidationException("Assignee not found with ID: " + request.assigneeId()));
            ticket.setAssignee(assignee);
        } else {
            ticket.setAssignee(null); // Clear assignment (TICK-05)
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponseDTO(updatedTicket);
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, UpdateStatusRequestDTO request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));

        ticket.setStatus(request.status());
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponseDTO(updatedTicket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
        ticketRepository.delete(ticket);
    }
}