package com.sumpositive.ticketing.dashboard.service;

import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.PriorityMetrics;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO.StatusMetrics;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import com.sumpositive.ticketing.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;

    public DashboardService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardMetrics() {
        // Status counts
        long toDo = ticketRepository.countByStatus(TicketStatus.TO_DO);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long done = ticketRepository.countByStatus(TicketStatus.DONE);
        long total = toDo + inProgress + done; // Formula strictly verified (DASH-01)

        StatusMetrics statusMetrics = new StatusMetrics(total, toDo, inProgress, done);

        // Priority counts
        long low = ticketRepository.countByPriority(TicketPriority.LOW);
        long medium = ticketRepository.countByPriority(TicketPriority.MEDIUM);
        long high = ticketRepository.countByPriority(TicketPriority.HIGH);

        PriorityMetrics priorityMetrics = new PriorityMetrics(low, medium, high);

        return new DashboardSummaryDTO(statusMetrics, priorityMetrics);
    }
}