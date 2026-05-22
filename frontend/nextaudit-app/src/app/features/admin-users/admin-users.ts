import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUser, AdminUsersService, CreateAdminUserRequest } from '../../services/admin-users.service';
import { UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  protected readonly adminUsers = inject(AdminUsersService);
  protected readonly roles: Array<{ code: UserRole; label: string }> = [
    { code: 'viewer', label: 'Usuario comun' },
    { code: 'admin', label: 'Administrador' },
    { code: 'super_admin', label: 'Super usuario' },
  ];

  readonly form = signal<CreateAdminUserRequest>({
    email: '',
    displayName: '',
    password: '',
    role: 'viewer',
    isActive: true,
  });
  readonly query = signal('');
  readonly editingUserId = signal<string | null>(null);
  readonly feedback = signal<string | null>(null);

  readonly filteredUsers = computed(() => {
    const text = this.query().trim().toLowerCase();
    if (!text) return this.adminUsers.users();

    return this.adminUsers.users().filter((user) => {
      return (
        user.email.toLowerCase().includes(text) ||
        user.displayName.toLowerCase().includes(text) ||
        this.roleLabel(user.role).toLowerCase().includes(text)
      );
    });
  });

  constructor() {
    this.adminUsers.loadUsers().subscribe({
      error: () => this.adminUsers.error.set('No fue posible cargar los usuarios.'),
    });
  }

  updateField(field: keyof CreateAdminUserRequest, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = field === 'isActive' ? (target as HTMLInputElement).checked : target.value;
    this.form.update((current) => ({ ...current, [field]: value }));
  }

  updateQuery(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value || '');
  }

  createUser() {
    this.feedback.set(null);

    this.adminUsers.createUser(this.form()).subscribe({
      next: () => {
        this.feedback.set('Usuario creado correctamente.');
        this.form.set({
          email: '',
          displayName: '',
          password: '',
          role: 'viewer',
          isActive: true,
        });
      },
      error: (error) => this.adminUsers.error.set(error?.error?.message ?? 'No fue posible crear el usuario.'),
    });
  }

  setRole(user: AdminUser, role: UserRole) {
    this.editingUserId.set(user.id);
    this.adminUsers.updateUser(user.id, { role }).subscribe({
      next: () => this.editingUserId.set(null),
      error: (error) => {
        this.editingUserId.set(null);
        this.adminUsers.error.set(error?.error?.message ?? 'No fue posible actualizar el rol.');
      },
    });
  }

  setActive(user: AdminUser, isActive: boolean) {
    this.editingUserId.set(user.id);
    this.adminUsers.updateUser(user.id, { isActive }).subscribe({
      next: () => this.editingUserId.set(null),
      error: (error) => {
        this.editingUserId.set(null);
        this.adminUsers.error.set(error?.error?.message ?? 'No fue posible actualizar el estado.');
      },
    });
  }

  roleLabel(role: UserRole): string {
    return this.roles.find((item) => item.code === role)?.label ?? role;
  }
}
