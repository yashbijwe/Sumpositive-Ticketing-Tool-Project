import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateTicketRequest,
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketRequest
} from '../../../core/models/ticket.model';
import { UserSummary } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe, NgTemplateOutlet, ReactiveFormsModule, WorkspaceHeaderComponent],
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss'
})
export class TicketListComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly userService = inject(UserService);
  readonly statuses: TicketStatus[] = ['TO_DO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
  readonly ticketForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(1000)],
    status: this.formBuilder.nonNullable.control<TicketStatus>('TO_DO'),
    priority: this.formBuilder.nonNullable.control<TicketPriority>('MEDIUM'),
    assigneeId: this.formBuilder.control<number | null>(null),
    dueDate: ['']
  });

  tickets: Ticket[] = [];
  users: UserSummary[] = [];
  searchTerm = '';
  statusFilter: 'ALL' | TicketStatus = 'ALL';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  modalError = '';
  usersError = '';
  isLoadingUsers = false;
  isModalOpen = false;
  editingTicket: Ticket | null = null;

  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  get isStatusOnlyEdit(): boolean {
    return (
      !this.isAdmin &&
      this.editingTicket?.assignee?.id === this.authService.getCurrentUser()?.id
    );
  }

  get assignedTickets(): Ticket[] {
    const currentUserId = this.authService.getCurrentUser()?.id;
    return this.tickets.filter((ticket) => ticket.assignee?.id === currentUserId);
  }

  get otherTickets(): Ticket[] {
    if (this.isAdmin) {
      return this.tickets;
    }

    const currentUserId = this.authService.getCurrentUser()?.id;
    return this.tickets.filter((ticket) => ticket.assignee?.id !== currentUserId);
  }

  get filteredTickets(): Ticket[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.filterTickets(this.otherTickets, query);
  }

  get filteredAssignedTickets(): Ticket[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.filterTickets(this.assignedTickets, query);
  }

  get filteredTicketCount(): number {
    return this.filteredTickets.length + (this.isAdmin ? 0 : this.filteredAssignedTickets.length);
  }

  private filterTickets(tickets: Ticket[], query: string): Ticket[] {
    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        (ticket.description ?? '').toLowerCase().includes(query) ||
        String(ticket.id).includes(query);
      const matchesStatus = this.statusFilter === 'ALL' || ticket.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  updateSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerm = event.target.value;
    }
  }

  updateStatusFilter(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) {
      return;
    }

    const value = event.target.value;
    this.statusFilter =
      value === 'TO_DO' || value === 'IN_PROGRESS' || value === 'DONE' ? value : 'ALL';
  }

  ngOnInit(): void {
    this.loadTickets();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.usersError = 'Could not load assignees. Please try again.';
        this.isLoadingUsers = false;
        this.changeDetector.markForCheck();
      }
    });
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
        this.errorMessage = 'Could not load tickets. Check your connection and try again.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  openCreateModal(): void {
    this.editingTicket = null;
    this.modalError = '';
    this.ticketForm.reset({
      title: '',
      description: '',
      status: 'TO_DO',
      priority: 'MEDIUM',
      assigneeId: null,
      dueDate: ''
    });
    this.isModalOpen = true;
  }

  openEditModal(ticket: Ticket): void {
    this.editingTicket = ticket;
    this.modalError = '';
    this.ticketForm.reset({
      title: ticket.title,
      description: ticket.description ?? '',
      status: ticket.status,
      priority: ticket.priority,
      assigneeId: ticket.assignee?.id ?? null,
      dueDate: ticket.dueDate?.slice(0, 10) ?? ''
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (!this.isSaving) {
      this.isModalOpen = false;
    }
  }

  submitTicket(): void {
    this.ticketForm.markAllAsTouched();
    this.modalError = '';
    if (this.ticketForm.invalid || this.isSaving) {
      return;
    }

    const formValue = this.ticketForm.getRawValue();
    const details: UpdateTicketRequest = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || undefined,
      status: formValue.status,
      priority: formValue.priority,
      assigneeId: formValue.assigneeId,
      dueDate: formValue.dueDate || null
    };
    this.isSaving = true;
    const request = this.editingTicket
      ? this.isStatusOnlyEdit
        ? this.ticketService.updateStatus(this.editingTicket.id, formValue.status)
        : this.ticketService.updateTicket(this.editingTicket.id, details)
      : this.ticketService.createTicket(details satisfies CreateTicketRequest);

    request.subscribe({
      next: (savedTicket) => {
        if (this.editingTicket) {
          this.tickets = this.tickets.map((ticket) =>
            ticket.id === savedTicket.id ? savedTicket : ticket
          );
        } else {
          this.tickets = [savedTicket, ...this.tickets];
        }
        this.isSaving = false;
        this.isModalOpen = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.modalError =
          error.status === 0
            ? 'Could not connect to the ticket service. Please try again.'
            : 'Could not save this ticket. Check the details and try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteTicket(ticket: Ticket): void {
    if (!window.confirm(`Delete "${ticket.title}"? This action cannot be undone.`)) {
      return;
    }

    this.errorMessage = '';
    this.ticketService.deleteTicket(ticket.id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter((item) => item.id !== ticket.id);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not delete the ticket. Please try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  statusLabel(status: TicketStatus): string {
    return { TO_DO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' }[status];
  }

  statusClass(status: TicketStatus): string {
    return `status-pill status-${status.toLowerCase().replace('_', '-')}`;
  }

  priorityClass(priority: TicketPriority): string {
    return `priority-pill priority-${priority.toLowerCase()}`;
  }
}
