import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ticket, TicketStatus } from '../../core/models/ticket.model';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, WorkspaceHeaderComponent],
  template: `
    <main class="dashboard-page">
      <app-workspace-header />
      <div class="page-content">
        <section class="page-heading">
          <div>
            <p class="eyebrow">{{ isAdmin ? 'ADMIN CONTROL CENTER' : 'YOUR WORKSPACE' }}</p>
            <h1>{{ isAdmin ? 'Workspace overview' : 'Ticket dashboard' }}</h1>
            <p class="subheading">
              {{ isAdmin ? 'Monitor tickets and activity across your entire workspace.' : 'A quick look at what your team is working on.' }}
            </p>
          </div>
          <a class="primary-link" [routerLink]="isAdmin ? '/users' : '/tickets'">
            <i [class]="isAdmin ? 'bi bi-people' : 'bi bi-plus-lg'" aria-hidden="true"></i>
            {{ isAdmin ? 'Manage users' : 'Create a ticket' }}
          </a>
        </section>

        @if (errorMessage) {
          <div class="error-banner" role="alert">
            <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
            {{ errorMessage }}
            <button type="button" (click)="loadTickets()">Try again</button>
          </div>
        }

        <section class="metrics-grid" aria-label="Ticket totals">
          <article class="metric-card">
            <span class="metric-icon all-icon"><i class="bi bi-ticket-detailed" aria-hidden="true"></i></span>
            <span class="metric-label">All tickets</span>
            <strong>{{ tickets.length }}</strong>
            <span class="metric-footnote">{{ isAdmin ? 'Across the workspace' : 'In your workspace' }}</span>
          </article>
          <article class="metric-card">
            <span class="metric-icon todo-icon"><i class="bi bi-circle" aria-hidden="true"></i></span>
            <span class="metric-label">To do</span>
            <strong>{{ countByStatus('TO_DO') }}</strong>
            <span class="metric-footnote">Ready to get started</span>
          </article>
          <article class="metric-card">
            <span class="metric-icon progress-icon"><i class="bi bi-arrow-repeat" aria-hidden="true"></i></span>
            <span class="metric-label">In progress</span>
            <strong>{{ countByStatus('IN_PROGRESS') }}</strong>
            <span class="metric-footnote">Being worked on</span>
          </article>
          <article class="metric-card">
            <span class="metric-icon done-icon"><i class="bi bi-check2-circle" aria-hidden="true"></i></span>
            <span class="metric-label">Done</span>
            <strong>{{ countByStatus('DONE') }}</strong>
            <span class="metric-footnote">Completed tickets</span>
          </article>
        </section>

        <section class="recent-section">
          <div class="section-heading">
            <div>
              <h2>{{ isAdmin ? 'Workspace tickets' : 'Recent tickets' }}</h2>
              <p>{{ isAdmin ? 'Latest ticket activity across all users.' : 'Your latest updates, all in one place.' }}</p>
            </div>
            <a routerLink="/tickets">View all tickets <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
          </div>

          @if (isLoading) {
            <div class="loading-state"><span class="spinner"></span> Loading your workspace...</div>
          } @else if (tickets.length === 0 && !errorMessage) {
            <div class="empty-state">
              <span class="empty-icon"><i class="bi bi-inbox" aria-hidden="true"></i></span>
              <strong>No tickets yet</strong>
              <p>Create your first ticket to start tracking work.</p>
              <a routerLink="/tickets">Create a ticket</a>
            </div>
          } @else if (tickets.length > 0) {
            <div class="ticket-list">
              @for (ticket of recentTickets; track ticket.id) {
                <a class="ticket-row" routerLink="/tickets">
                  <span class="ticket-mark"><i class="bi bi-ticket-perforated" aria-hidden="true"></i></span>
                  <span class="ticket-info">
                    <strong>{{ ticket.title }}</strong>
                    <small>#{{ ticket.id }} <span>·</span> Updated {{ ticket.updatedAt | date: 'mediumDate' }}</small>
                  </span>
                  <span class="priority-pill" [class]="priorityClass(ticket.priority)">
                    {{ ticket.priority }}
                  </span>
                  <span class="status-pill" [class]="statusClass(ticket.status)">
                    {{ statusLabel(ticket.status) }}
                  </span>
                  <i class="bi bi-chevron-right row-chevron" aria-hidden="true"></i>
                </a>
              }
            </div>
          }
        </section>
      </div>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; }
    .dashboard-page { min-height: 100vh; background: #f5f7fb; }
    .page-content { max-width: 1200px; margin: 0 auto; padding: 42px 32px 64px; }
    .page-heading, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .eyebrow { margin: 0 0 8px; color: #188b7d; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
    h1 { margin: 0; color: #182b42; font: 700 28px 'Segoe UI', sans-serif; letter-spacing: -1px; }
    .subheading, .section-heading p { margin: 7px 0 0; color: #8290a0; font-size: 12px; }
    .primary-link { display: inline-flex; align-items: center; gap: 8px; padding: 11px 15px; border-radius: 7px; color: #fff; background: #188b7d; font-size: 12px; font-weight: 700; text-decoration: none; }
    .primary-link:hover { background: #13796e; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 31px; }
    .metric-card { display: grid; grid-template-columns: 39px 1fr; align-items: center; column-gap: 12px; padding: 19px; border: 1px solid #e7ecf1; border-radius: 10px; background: #fff; }
    .metric-icon { display: grid; width: 37px; height: 37px; grid-row: span 2; place-items: center; border-radius: 10px; font-size: 16px; }
    .all-icon { color: #5578bb; background: #edf2fb; }
    .todo-icon { color: #bb8b3c; background: #fbf4e8; }
    .progress-icon { color: #5584be; background: #edf5fc; }
    .done-icon { color: #26917b; background: #eaf6f2; }
    .metric-label { color: #7d8b9b; font-size: 11px; }
    .metric-card strong { margin-top: 2px; color: #1d3148; font: 700 24px 'Segoe UI', sans-serif; }
    .metric-footnote { grid-column: 2; margin-top: 5px; color: #9aa6b2; font-size: 10px; }
    .recent-section { margin-top: 37px; }
    .section-heading { margin-bottom: 15px; }
    .section-heading h2 { margin: 0; color: #26394e; font-size: 15px; font-weight: 700; }
    .section-heading a { color: #188b7d; font-size: 11px; font-weight: 700; text-decoration: none; }
    .ticket-list { overflow: hidden; border: 1px solid #e7ecf1; border-radius: 10px; background: #fff; }
    .ticket-row { display: flex; min-height: 67px; align-items: center; gap: 14px; padding: 0 19px; border-bottom: 1px solid #edf0f4; color: inherit; text-decoration: none; }
    .ticket-row:last-child { border-bottom: 0; }
    .ticket-row:hover { background: #fbfdfd; }
    .ticket-mark { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border-radius: 9px; color: #5e83ac; background: #f0f5f9; }
    .ticket-info { display: grid; flex: 1; gap: 4px; min-width: 0; }
    .ticket-info strong { overflow: hidden; color: #26394e; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
    .ticket-info small { color: #95a0ad; font-size: 10px; }
    .ticket-info small span { padding: 0 3px; }
    .priority-pill, .status-pill { padding: 5px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; white-space: nowrap; }
    .priority-high { color: #b94a4a; background: #fff0ef; }
    .priority-medium { color: #9a741f; background: #fff7e6; }
    .priority-low { color: #547a98; background: #eff5f8; }
    .status-to-do { color: #99732c; background: #fbf4e5; }
    .status-in-progress { color: #4a78a6; background: #edf4fb; }
    .status-done { color: #27806e; background: #eaf6f2; }
    .row-chevron { color: #aab4bf; font-size: 11px; }
    .empty-state, .loading-state { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #e7ecf1; border-radius: 10px; color: #8391a0; background: #fff; font-size: 12px; text-align: center; }
    .empty-icon { display: grid; width: 42px; height: 42px; place-items: center; margin-bottom: 11px; border-radius: 12px; color: #188b7d; background: #eaf6f2; font-size: 18px; }
    .empty-state strong { color: #26394e; font-size: 13px; }
    .empty-state p { margin: 6px 0 12px; }
    .empty-state a { color: #188b7d; font-weight: 700; text-decoration: none; }
    .loading-state { flex-direction: row; gap: 10px; }
    .spinner { width: 16px; height: 16px; border: 2px solid #dbe9e6; border-top-color: #188b7d; border-radius: 50%; animation: spin 650ms linear infinite; }
    .error-banner { display: flex; align-items: center; gap: 9px; margin-top: 22px; padding: 12px 14px; border: 1px solid #f1cccc; border-radius: 8px; color: #a54040; background: #fff4f3; font-size: 12px; }
    .error-banner button { margin-left: auto; border: 0; color: #a54040; background: transparent; cursor: pointer; font-size: 11px; font-weight: 700; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 760px) { .page-content { padding: 30px 20px 48px; } .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 520px) { .page-content { padding: 25px 16px 40px; } .page-heading { align-items: flex-start; } h1 { font-size: 24px; } .primary-link { padding: 10px; font-size: 0; } .primary-link i { font-size: 13px; } .metric-card { padding: 14px; } .ticket-row { gap: 8px; padding: 0 10px; } .priority-pill { display: none; } }
  `
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly ticketService = inject(TicketService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  tickets: Ticket[] = [];
  isLoading = true;
  errorMessage = '';

  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  get recentTickets(): Ticket[] {
    return [...this.tickets]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 5);
  }

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
        this.errorMessage = 'Could not load ticket data. Check your connection and try again.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  countByStatus(status: TicketStatus): number {
    return this.tickets.filter((ticket) => ticket.status === status).length;
  }

  statusLabel(status: TicketStatus): string {
    return { TO_DO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' }[status];
  }

  statusClass(status: TicketStatus): string {
    return `status-pill status-${status.toLowerCase().replace('_', '-')}`;
  }

  priorityClass(priority: Ticket['priority']): string {
    return `priority-pill priority-${priority.toLowerCase()}`;
  }
}
