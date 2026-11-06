package com.sumpositive.ticketing.dashboard.service;

import com.sumpositive.ticketing.common.exception.ResourceNotFoundException;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.PriorityMetrics;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.StatusMetrics;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.repository.TicketRepository;
import com.sumpositive.ticketing.user.entity.User;
import com.sumpositive.ticketing.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        long toDo = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.TO_DO);
        long inProgress = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.IN_PROGRESS);
        long done = ticketRepository.countByCreatorIdAndStatus(user.getId(), TicketStatus.DONE);
        long total = toDo + inProgress + done;

        StatusMetrics statusMetrics = new StatusMetrics(total, toDo, inProgress, done);

        long low = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.LOW);
        long medium = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.MEDIUM);
        long high = ticketRepository.countByCreatorIdAndPriority(user.getId(), TicketPriority.HIGH);

        PriorityMetrics priorityMetrics = new PriorityMetrics(low, medium, high);

        return new DashboardSummaryDTO(statusMetrics, priorityMetrics);
    }
}