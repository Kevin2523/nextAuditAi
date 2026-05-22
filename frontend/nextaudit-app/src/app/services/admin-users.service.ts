import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { UserRole } from './auth.service';

export interface AdminUser {
  id: string;
  membershipId: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserRequest {
  email: string;
  displayName: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateAdminUserRequest {
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly base = '/api/v1/admin/users';

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<{ users: AdminUser[] }>(this.base).pipe(
      tap((response) => this.users.set(response.users)),
      finalize(() => this.loading.set(false)),
    );
  }

  createUser(payload: CreateAdminUserRequest) {
    this.saving.set(true);
    this.error.set(null);

    return this.http.post<AdminUser>(this.base, payload).pipe(
      tap((user) => this.users.update((users) => [...users, user])),
      finalize(() => this.saving.set(false)),
    );
  }

  updateUser(userId: string, payload: UpdateAdminUserRequest) {
    this.saving.set(true);
    this.error.set(null);

    return this.http.patch<AdminUser>(`${this.base}/${userId}`, payload).pipe(
      tap((updated) =>
        this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user))),
      ),
      finalize(() => this.saving.set(false)),
    );
  }
}
