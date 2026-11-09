package com.sumpositive.ticketing.dashboard.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sumpositive.ticketing.common.exception.ResourceNotFoundException;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.PriorityMetrics;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.StatusMetrics;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.repository.TicketRepository;
import com.sumpositive.ticketing.user.entity.Role;
import com.sumpositive.ticketing.user.entity.User;
import com.sumpositive.ticketing.user.repository.UserRepository;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardMetrics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        long toDo, inProgress, done, low, medium, high;

        if (user.getRole() == Role.ROLE_ADMIN) {
            // Admin sees global totals across all users
            toDo = ticketRepository.countByStatus(TicketStatus.TO_DO);
            inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
            done = ticketRepository.countByStatus(TicketStatus.DONE);
            low = ticketRepository.countByPriority(TicketPriority.LOW);
            medium = ticketRepository.countByPriority(TicketPriority.MEDIUM);
            high = ticketRepository.countByPriority(TicketPriority.HIGH);
        } else {
            // Standard user only sees their own scoped metrics
            toDo = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.TO_DO);
            inProgress = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.IN_PROGRESS);
            done = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.DONE);
            low = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.LOW);
            medium = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.MEDIUM);
            high = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.HIGH);
        }

        long total = toDo + inProgress + done;
        return new DashboardSummaryDTO(
                new StatusMetrics(total, toDo, inProgress, done),
                new PriorityMetrics(low, medium, high)
        );
    }
}