package com.sumpositive.ticketing.ticket.mapper;

import com.sumpositive.ticketing.ticket.dto.TicketResponseDTO;
import com.sumpositive.ticketing.ticket.entity.Ticket;
import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketResponseDTO toResponseDTO(Ticket ticket) {
        if (ticket == null) {
            return null;
        }

        UserSummaryDTO assigneeDTO = null;
        if (ticket.getAssignee() != null) {
            assigneeDTO = new UserSummaryDTO(
                    ticket.getAssignee().getId(),
                    ticket.getAssignee().getName(),
                    ticket.getAssignee().getEmail()
            );
        }

        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                assigneeDTO,
                ticket.getDueDate(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}