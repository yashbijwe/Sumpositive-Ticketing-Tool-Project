import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { Ticket } from '../../core/models/ticket.model';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  it('shows recent tickets after the ticket request completes', async () => {
    const tickets$ = new Subject<Ticket[]>();
    const ticketService = { getTickets: vi.fn(() => tickets$.asObservable()) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), hasRole: vi.fn(() => false) } },
        { provide: TicketService, useValue: ticketService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading your workspace');

    tickets$.next([
      {
        id: 1,
        title: 'Recent ticket',
        status: 'TO_DO',
        priority: 'MEDIUM',
        createdAt: '2026-11-05T10:00:00Z',
        updatedAt: '2026-11-05T10:00:00Z'
      }
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Recent ticket');
    expect(fixture.nativeElement.textContent).not.toContain('Loading your workspace');
  });
});
