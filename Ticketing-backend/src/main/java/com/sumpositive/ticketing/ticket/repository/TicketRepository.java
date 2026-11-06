package com.sumpositive.ticketing.ticket.repository;

import com.sumpositive.ticketing.ticket.entity.Ticket;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {
    
    // User-scoped status counts
    long countByCreatorIdAndStatus(Long creatorId, TicketStatus status);
    
    // User-scoped priority counts
    long countByCreatorIdAndPriority(Long creatorId, TicketPriority priority);
}