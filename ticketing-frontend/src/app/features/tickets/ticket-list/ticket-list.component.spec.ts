import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Ticket } from '../../../core/models/ticket.model';
import { AuthService } from '../../../core/services/auth.service';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { TicketListComponent } from './ticket-list.component';

describe('TicketListComponent', () => {
  it('shows ticket assignees and submits the selected assignee when creating a ticket', async () => {
    const user = { id: 7, name: 'Taylor User', email: 'taylor@example.com' };
    const ticket: Ticket = {
      id: 1,
      title: 'Assigned ticket',
      status: 'TO_DO',
      priority: 'MEDIUM',
      assignee: user,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };
    const ticketService = {
      getTickets: vi.fn(() => of([ticket])),
      createTicket: vi.fn(() => of(ticket))
    };
    const authService = {
      currentUser$: of(null),
      hasRole: vi.fn(() => false),
      getCurrentUser: vi.fn(() => ({ id: 8, name: 'Current User', email: 'current@example.com' }))
    };

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TicketService, useValue: ticketService },
        { provide: UserService, useValue: { getUsers: vi.fn(() => of([user])) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Taylor User');
    expect(fixture.nativeElement.textContent).not.toContain('Created by');

    const component = fixture.componentInstance;
    component.openCreateModal();
    component.ticketForm.patchValue({
      title: 'New ticket',
      assigneeId: user.id
    });
    component.submitTicket();

    expect(ticketService.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New ticket', assigneeId: user.id })
    );
  });

  it('shows tickets assigned to the current user in a separate section', async () => {
    const currentUser = { id: 7, name: 'Vedant Yadgire', email: 'vedant@example.com' };
    const assignedTicket: Ticket = {
      id: 1,
      title: 'Assigned to Vedant',
      status: 'TO_DO',
      priority: 'MEDIUM',
      assignee: currentUser,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };
    const otherTicket: Ticket = {
      id: 2,
      title: 'Unassigned ticket',
      status: 'TO_DO',
      priority: 'LOW',
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: of(currentUser),
            hasRole: vi.fn(() => false),
            getCurrentUser: vi.fn(() => currentUser)
          }
        },
        { provide: TicketService, useValue: { getTickets: vi.fn(() => of([assignedTicket, otherTicket])) } },
        { provide: UserService, useValue: { getUsers: vi.fn(() => of([])) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();

    const assignedSection = fixture.nativeElement.querySelector(
      '[aria-labelledby="assigned-tickets-title"]'
    );
    const otherSection = fixture.nativeElement.querySelector('[aria-labelledby="other-tickets-title"]');

    expect(assignedSection.textContent).toContain('Assigned to Vedant');
    expect(assignedSection.textContent).not.toContain('Unassigned ticket');
    expect(otherSection.textContent).toContain('Unassigned ticket');
    expect(otherSection.textContent).not.toContain('Assigned to Vedant');
  });

  it('lets a regular user update only the status of an assigned ticket', async () => {
    const currentUser = { id: 7, name: 'Vedant Yadgire', email: 'vedant@example.com' };
    const ticket: Ticket = {
      id: 3,
      title: 'Assigned work',
      status: 'TO_DO',
      priority: 'HIGH',
      assignee: currentUser,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };
    const updatedTicket = { ...ticket, status: 'IN_PROGRESS' as const };
    const ticketService = {
      getTickets: vi.fn(() => of([ticket])),
      updateStatus: vi.fn(() => of(updatedTicket)),
      updateTicket: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: of(currentUser),
            hasRole: vi.fn(() => false),
            getCurrentUser: vi.fn(() => currentUser)
          }
        },
        { provide: TicketService, useValue: ticketService },
        { provide: UserService, useValue: { getUsers: vi.fn(() => of([])) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="Edit ticket"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#ticket-title')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-description')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-priority')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-assignee')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-due-date')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-status')).not.toBeNull();

    fixture.componentInstance.ticketForm.controls.status.setValue('IN_PROGRESS');
    fixture.componentInstance.submitTicket();

    expect(ticketService.updateStatus).toHaveBeenCalledWith(ticket.id, 'IN_PROGRESS');
    expect(ticketService.updateTicket).not.toHaveBeenCalled();
  });

  it('shows ticket creators only for administrators', async () => {
    const creator = { id: 8, name: 'Ticket Creator', email: 'creator@example.com' };
    const ticket: Ticket = {
      id: 2,
      title: 'Admin-visible ticket',
      status: 'TO_DO',
      priority: 'LOW',
      assignee: creator,
      creator,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: of(null),
            hasRole: vi.fn(() => true),
            getCurrentUser: vi.fn(() => null)
          }
        },
        { provide: TicketService, useValue: { getTickets: vi.fn(() => of([ticket])) } },
        { provide: UserService, useValue: { getUsers: vi.fn(() => of([])) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Created by');
    expect(fixture.nativeElement.textContent).toContain('Ticket Creator');

    fixture.nativeElement.querySelector('[aria-label="Edit ticket"]').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#ticket-status')).toBeNull();
    expect(fixture.nativeElement.querySelector('#ticket-priority')).not.toBeNull();
  });
});
