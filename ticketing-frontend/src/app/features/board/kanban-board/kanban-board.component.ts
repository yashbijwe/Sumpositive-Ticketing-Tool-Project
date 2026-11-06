import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-kanban-board',
  imports: [WorkspaceHeaderComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss'
})
export class KanbanBoardComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly columns: { status: TicketStatus; title: string; icon: string }[] = [
    { status: 'TO_DO', title: 'To do', icon: 'bi-circle' },
    { status: 'IN_PROGRESS', title: 'In progress', icon: 'bi-arrow-repeat' },
    { status: 'DONE', title: 'Done', icon: 'bi-check2-circle' }
  ];

  tickets: Ticket[] = [];
  isLoading = true;
  errorMessage = '';
  updatingTicketIds = new Set<number>();

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not load your board. Check your connection and try again.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  ticketsFor(status: TicketStatus): Ticket[] {
    return this.tickets.filter((ticket) => ticket.status === status);
  }

  move(ticket: Ticket, status: TicketStatus): void {
    if (ticket.status === status || this.updatingTicketIds.has(ticket.id)) {
      return;
    }

    this.errorMessage = '';
    this.updatingTicketIds.add(ticket.id);
    this.ticketService.updateStatus(ticket.id, status).subscribe({
      next: (updatedTicket) => {
        this.tickets = this.tickets.map((item) => item.id === ticket.id ? updatedTicket : item);
        this.updatingTicketIds.delete(ticket.id);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.updatingTicketIds.delete(ticket.id);
        this.errorMessage = `Could not move "${ticket.title}". Please try again.`;
        this.changeDetector.markForCheck();
      }
    });
  }

  statusLabel(status: TicketStatus): string {
    return { TO_DO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' }[status];
  }

  priorityClass(priority: Ticket['priority']): string {
    return `priority-${priority.toLowerCase()}`;
  }
}
