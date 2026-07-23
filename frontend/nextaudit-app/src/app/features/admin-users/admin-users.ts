import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminUser, AdminUsersService, CreateAdminUserRequest } from '../../services/admin-users.service';
import { AuthService, UserRole, PASSWORD_POLICY_REGEX } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  protected readonly adminUsers = inject(AdminUsersService);
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly roles: Array<{ code: UserRole; label: string }> = [
    { code: 'viewer', label: 'Usuario comun' },
    { code: 'admin', label: 'Administrador' },
    { code: 'super_admin', label: 'Super usuario' },
  ];

  readonly createUserForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    displayName: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_POLICY_REGEX)]],
    role: ['viewer', Validators.required],
    isActive: [true],
  });

  readonly passwordRules = signal({ length: false, uppercase: false, lowercase: false, number: false, special: false });
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

    this.createUserForm.get('password')?.valueChanges.subscribe(pw => {
      this.passwordRules.set({
        length: (pw ?? '').length >= 12,
        uppercase: /[A-Z]/.test(pw ?? ''),
        lowercase: /[a-z]/.test(pw ?? ''),
        number: /[0-9]/.test(pw ?? ''),
        special: /[^A-Za-z0-9]/.test(pw ?? ''),
      });
    });
  }

  updateQuery(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value || '');
  }

  createUser() {
    this.feedback.set(null);

    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    const formValue = this.createUserForm.value;

    this.adminUsers.createUser(formValue as CreateAdminUserRequest).subscribe({
      next: () => {
        this.feedback.set('Usuario creado correctamente.');
        this.createUserForm.reset({
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
    if (user.role === role) return;

    this.editingUserId.set(user.id);
    this.adminUsers.updateUser(user.id, { role }).subscribe({
      next: () => this.editingUserId.set(null),
      error: (error) => {
        this.editingUserId.set(null);
        this.adminUsers.error.set(error?.error?.message ?? 'No fue posible actualizar el rol.');
      },
    });
  }

  setDisplayName(user: AdminUser, event: Event) {
    const target = event.target as HTMLInputElement;
    const displayName = target.value.trim();

    if (!displayName || displayName === user.displayName) {
      target.value = user.displayName;
      return;
    }

    this.editingUserId.set(user.id);
    this.adminUsers.updateUser(user.id, { displayName }).subscribe({
      next: () => this.editingUserId.set(null),
      error: (error) => {
        target.value = user.displayName;
        this.editingUserId.set(null);
        this.adminUsers.error.set(error?.error?.message ?? 'No fue posible actualizar el nombre.');
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

  isCurrentUser(user: AdminUser): boolean {
    return this.auth.currentUserSignal()?.id === user.id;
  }
}
