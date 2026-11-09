import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isRegisterMode = false;
  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.loginForm.reset();
    this.loginForm.controls.name.setValidators(
      this.isRegisterMode
        ? [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
        : []
    );
    this.loginForm.controls.name.updateValueAndValidity();
    this.loginForm.controls.password.setValidators(
      this.isRegisterMode
        ? [Validators.required, Validators.minLength(6)]
        : Validators.required
    );
    this.loginForm.controls.password.updateValueAndValidity();
  }

  submit(): void {
    this.errorMessage = '';
    this.loginForm.patchValue({
      name: this.loginForm.controls.name.value.trim(),
      email: this.loginForm.controls.email.value.trim()
    });
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.loginForm.getRawValue();
    const request = this.isRegisterMode
      ? this.authService.register({
          name: formValue.name.trim(),
          email: formValue.email.trim(),
          password: formValue.password
        } satisfies RegisterRequest)
      : this.authService.login({
          email: formValue.email.trim(),
          password: formValue.password
        });

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        if (error instanceof TimeoutError) {
          this.errorMessage = this.isRegisterMode
            ? 'The server took too long to respond. Check whether your account was created before trying again.'
            : 'The server took too long to respond. Please try again.';
        } else if (error instanceof HttpErrorResponse && error.status === 401 && this.isRegisterMode) {
          this.errorMessage = 'Registration is not available on the running server. Restart the backend and try again.';
        } else if (error instanceof HttpErrorResponse && error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error instanceof HttpErrorResponse && error.status === 400 && this.isRegisterMode) {
          this.errorMessage =
            this.getResponseMessage(error) ?? 'Please check your details. This email may already be registered.';
        } else {
          this.errorMessage = 'We could not connect to the ticketing service. Please try again.';
        }
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
