import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { WorkspaceHeaderComponent } from '../../shared/components/workspace-header/workspace-header.component';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, WorkspaceHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]]
  });

  isSaving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm.reset({ name: user.name, email: user.email });
    }
  }

  saveProfile(): void {
    this.profileForm.patchValue({
      name: this.profileForm.controls.name.value.trim(),
      email: this.profileForm.controls.email.value.trim()
    });
    this.profileForm.markAllAsTouched();
    this.errorMessage = '';
    this.successMessage = '';
    const user = this.authService.getCurrentUser();

    if (this.profileForm.invalid || this.isSaving || !user) {
      return;
    }

    this.isSaving = true;
    const details = this.profileForm.getRawValue();
    this.userService
      .updateUser(user.id, {
        ...details,
        role: user.role ?? ('ROLE_USER' satisfies UserRole)
      })
      .subscribe({
        next: (savedUser) => {
          this.authService.updateCurrentUser(savedUser);
          this.profileForm.reset({ name: savedUser.name, email: savedUser.email });
          this.isSaving = false;
          this.successMessage = 'Your profile has been updated.';
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving = false;
          this.errorMessage =
            error.status === 400
              ? this.getResponseMessage(error) ?? 'Please check your details and try again.'
              : 'Could not update your profile. Please try again.';
          this.changeDetector.markForCheck();
        }
      });
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
