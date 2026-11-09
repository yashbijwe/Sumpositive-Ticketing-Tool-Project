import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-workspace-header',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './workspace-header.component.html',
  styleUrl: './workspace-header.component.scss'
})
export class WorkspaceHeaderComponent {
  readonly authService = inject(AuthService);
  readonly currentUser$ = this.authService.currentUser$;
  isProfileOpen = false;

  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }
}
