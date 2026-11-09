import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdateUserRequest, UserSummary } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = 'http://localhost:8080/api/users';
  private readonly http = inject(HttpClient);

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.apiUrl);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<UserSummary> {
    return this.http.put<UserSummary>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
