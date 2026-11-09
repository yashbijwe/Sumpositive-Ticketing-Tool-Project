export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}
