import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  it('updates the signed-in user and preserves their role', async () => {
    const user = { id: 7, name: 'Taylor User', email: 'taylor@example.com', role: 'ROLE_ADMIN' as const };
    const updatedUser = { ...user, name: 'Taylor Updated', email: 'updated@example.com' };
    const authService = {
      currentUser$: of(user),
      getCurrentUser: vi.fn(() => user),
      hasRole: vi.fn(() => true),
      updateCurrentUser: vi.fn()
    };
    const userService = { updateUser: vi.fn(() => of(updatedUser)) };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.profileForm.setValue({ name: ' Taylor Updated ', email: ' updated@example.com ' });
    component.saveProfile();

    expect(userService.updateUser).toHaveBeenCalledWith(user.id, {
      name: 'Taylor Updated',
      email: 'updated@example.com',
      role: 'ROLE_ADMIN'
    });
    expect(authService.updateCurrentUser).toHaveBeenCalledWith(updatedUser);
    expect(component.successMessage).toBe('Your profile has been updated.');
  });
});
