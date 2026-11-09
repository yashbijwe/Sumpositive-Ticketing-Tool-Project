package com.sumpositive.ticketing.ticket.mapper;

import com.sumpositive.ticketing.ticket.dto.TicketResponseDTO;
import com.sumpositive.ticketing.ticket.entity.Ticket;
import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketResponseDTO toResponseDTO(Ticket ticket, boolean includeCreator) {
        if (ticket == null) {
            return null;
        }

        UserSummaryDTO assigneeDTO = null;
        if (ticket.getAssignee() != null) {
            assigneeDTO = new UserSummaryDTO(
                    ticket.getAssignee().getId(),
                    ticket.getAssignee().getName(),
                    ticket.getAssignee().getEmail(),
                    ticket.getAssignee().getRole()
            );
        }

        UserSummaryDTO creatorDTO = null;
        String creatorName = null;
        if (includeCreator && ticket.getCreator() != null) {
            creatorName = ticket.getCreator().getName();
            creatorDTO = new UserSummaryDTO(
                    ticket.getCreator().getId(),
                    creatorName,
                    ticket.getCreator().getEmail(),
                    ticket.getCreator().getRole()
            );
        } else if (includeCreator) {
            creatorName = ticket.getCreatorName();
        }

        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                assigneeDTO,
                creatorDTO,
                creatorName,
                ticket.getDueDate(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}