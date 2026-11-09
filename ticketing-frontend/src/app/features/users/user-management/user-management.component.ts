import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRole, UserSummary } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { WorkspaceHeaderComponent } from '../../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-user-management',
  imports: [ReactiveFormsModule, WorkspaceHeaderComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly roles: UserRole[] = ['ROLE_USER', 'ROLE_ADMIN'];
  readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    role: this.formBuilder.nonNullable.control<UserRole>('ROLE_USER')
  });

  users: UserSummary[] = [];
  isLoading = true;
  isSaving = false;
  isModalOpen = false;
  errorMessage = '';
  modalError = '';
  editingUser: UserSummary | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Could not load users. Check your connection and try again.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  openEditModal(user: UserSummary): void {
    this.editingUser = user;
    this.modalError = '';
    this.userForm.reset({
      name: user.name,
      email: user.email,
      role: user.role ?? 'ROLE_USER'
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (!this.isSaving) {
      this.isModalOpen = false;
    }
  }

  submitUser(): void {
    this.userForm.markAllAsTouched();
    this.modalError = '';
    if (this.userForm.invalid || this.isSaving || !this.editingUser) {
      return;
    }

    this.isSaving = true;
    this.userService.updateUser(this.editingUser.id, this.userForm.getRawValue()).subscribe({
      next: (savedUser) => {
        this.users = this.users.map((user) => (user.id === savedUser.id ? savedUser : user));
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.id === savedUser.id) {
          this.authService.updateCurrentUser(savedUser);
        }
        this.isSaving = false;
        this.isModalOpen = false;
        this.changeDetector.markForCheck();

        if (currentUser?.id === savedUser.id && savedUser.role !== 'ROLE_ADMIN') {
          void this.router.navigateByUrl('/dashboard');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.modalError =
          error.status === 400
            ? this.getResponseMessage(error) ?? 'Please check the user details and try again.'
            : 'Could not update this user. Please try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteUser(user: UserSummary): void {
    if (!window.confirm(`Remove ${user.name}? Tickets will be kept, but their creator and assignee references will be cleared.`)) {
      return;
    }

    this.errorMessage = '';
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        const isCurrentUser = this.authService.getCurrentUser()?.id === user.id;
        this.users = this.users.filter((item) => item.id !== user.id);
        this.changeDetector.markForCheck();
        if (isCurrentUser) {
          this.authService.logout();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.status === 400
            ? this.getResponseMessage(error) ?? 'Could not remove this user.'
            : 'Could not remove this user. Please try again.';
        this.changeDetector.markForCheck();
      }
    });
  }

  roleLabel(role?: UserRole): string {
    return role === 'ROLE_ADMIN' ? 'Administrator' : 'User';
  }

  private getResponseMessage(error: HttpErrorResponse): string | null {
    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return null;
  }
}
