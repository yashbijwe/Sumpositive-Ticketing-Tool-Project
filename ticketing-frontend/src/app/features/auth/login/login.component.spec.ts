import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const configureComponent = async (authService: object) => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: 'dashboard', component: LoginComponent }]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();
  };

  it('registers a new user and signs them in', async () => {
    const authService = {
      register: vi.fn(() =>
        of({
          token: 'token',
          tokenType: 'Bearer',
          user: { id: 1, name: 'Taylor User', email: 'taylor@example.com' }
        })
      ),
      login: vi.fn()
    };

    await configureComponent(authService);

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.toggleMode();
    component.loginForm.setValue({
      name: ' Taylor User ',
      email: ' taylor@example.com ',
      password: 'secret1'
    });

    component.submit();

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Taylor User',
      email: 'taylor@example.com',
      password: 'secret1'
    });
  });

  it('stops loading and explains when registration is unauthorized', async () => {
    const authService = {
      register: vi.fn(() =>
        throwError(() => new HttpErrorResponse({ status: 401 }))
      ),
      login: vi.fn()
    };

    await configureComponent(authService);

    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.toggleMode();
    component.loginForm.setValue({
      name: 'Taylor User',
      email: 'taylor@example.com',
      password: 'secret1'
    });

    component.submit();

    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toContain('Restart the backend');
  });
});
