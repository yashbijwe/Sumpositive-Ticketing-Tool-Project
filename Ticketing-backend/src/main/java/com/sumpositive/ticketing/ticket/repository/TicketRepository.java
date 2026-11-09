package com.sumpositive.ticketing.ticket.repository;

import com.sumpositive.ticketing.ticket.entity.Ticket;
import com.sumpositive.ticketing.ticket.entity.TicketPriority;
import com.sumpositive.ticketing.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    // 1. Global count methods (used when Admin views the dashboard)
    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);

    // 2. Scoped count methods (used when a standard User views their dashboard)
    long countByCreatorIdAndStatus(Long creatorId, TicketStatus status);
    long countByCreatorIdAndPriority(Long creatorId, TicketPriority priority);

    @Modifying
    @Query(value = """
            update tickets
            set creator_name = coalesce(creator_name, (select name from users where id = :userId)),
                creator_id = null,
                updated_at = CURRENT_TIMESTAMP
            where creator_id = :userId
            """, nativeQuery = true)
    void clearCreatorByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("update Ticket t set t.assignee = null, t.updatedAt = CURRENT_TIMESTAMP where t.assignee.id = :userId")
    void clearAssigneeByUserId(@Param("userId") Long userId);
}