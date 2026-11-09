import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
  it('loads users and submits edits to the user service', async () => {
    const user = { id: 2, name: 'Taylor User', email: 'taylor@example.com', role: 'ROLE_USER' as const };
    const updatedUser = { ...user, name: 'Taylor Updated', role: 'ROLE_ADMIN' as const };
    const userService = {
      getUsers: vi.fn(() => of([user])),
      updateUser: vi.fn(() => of(updatedUser)),
      deleteUser: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser$: of({ id: 1, name: 'Admin', email: 'admin@example.com', role: 'ROLE_ADMIN' }),
            hasRole: vi.fn(() => true),
            getCurrentUser: () => ({ id: 1, role: 'ROLE_ADMIN' }),
            updateCurrentUser: vi.fn(),
            logout: vi.fn()
          }
        },
        { provide: UserService, useValue: userService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UserManagementComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Taylor User');

    const component = fixture.componentInstance;
    component.openEditModal(user);
    component.userForm.patchValue({ name: 'Taylor Updated', role: 'ROLE_ADMIN' });
    component.submitUser();

    expect(userService.updateUser).toHaveBeenCalledWith(user.id, {
      name: 'Taylor Updated',
      email: user.email,
      role: 'ROLE_ADMIN'
    });
    expect(component.users).toEqual([updatedUser]);
  });
});
