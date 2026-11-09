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

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser$: of(null), hasRole: vi.fn(() => false) } },
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

  it('shows ticket creators only for administrators', async () => {
    const creator = { id: 8, name: 'Ticket Creator', email: 'creator@example.com' };
    const ticket: Ticket = {
      id: 2,
      title: 'Admin-visible ticket',
      status: 'TO_DO',
      priority: 'LOW',
      creator,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z'
    };

    await TestBed.configureTestingModule({
      imports: [TicketListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser$: of(null), hasRole: vi.fn(() => true) } },
        { provide: TicketService, useValue: { getTickets: vi.fn(() => of([ticket])) } },
        { provide: UserService, useValue: { getUsers: vi.fn(() => of([])) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TicketListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Created by');
    expect(fixture.nativeElement.textContent).toContain('Ticket Creator');
  });
});
