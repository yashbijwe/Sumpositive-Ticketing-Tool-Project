import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((module) => module.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((module) => module.ProfileComponent)
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tickets/ticket-list/ticket-list.component').then(
        (module) => module.TicketListComponent
      )
  },
  {
    path: 'board',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/board/kanban-board/kanban-board.component').then(
        (module) => module.KanbanBoardComponent
      )
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/users/user-management/user-management.component').then(
        (module) => module.UserManagementComponent
      )
  },
  { path: '**', redirectTo: 'dashboard' }
];
