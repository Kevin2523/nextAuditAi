import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

export type UserRole = 'viewer' | 'admin' | 'super_admin';

export interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  exp?: number;
  iat?: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    tenantId: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenStorageKey = 'nextaudit.access_token';
  private readonly refreshTokenStorageKey = 'nextaudit.refresh_token';
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);

  readonly claimsSignal = computed<JwtClaims | null>(() => {
    const token = this.accessTokenSignal();
    if (!token) return null;

    const claims = this.decodeJwt(token);
    if (!claims || this.isExpired(claims)) return null;

    return claims;
  });

  readonly currentUserSignal = computed<CurrentUser | null>(() => {
    const claims = this.claimsSignal();
    if (!claims) return null;

    return {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      tenantId: claims.tenant_id,
    };
  });

  readonly isAuthenticated = computed(() => Boolean(this.currentUserSignal()));
  readonly role = computed(() => this.currentUserSignal()?.role ?? null);
  readonly canUseAi = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'super_admin';
  });

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<CurrentUser> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', credentials).pipe(
      tap((response) => this.storeSession(response.accessToken, response.refreshToken)),
      map(() => {
        const user = this.currentUserSignal();
        if (!user) {
          throw new Error('No se pudo iniciar la sesion.');
        }
        return user;
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  accessToken(): string | null {
    return this.accessTokenSignal();
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const role = this.role();
    return Boolean(role && roles.includes(role));
  }

  private storeSession(accessToken: string, refreshToken: string): void {
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    sessionStorage.setItem(this.accessTokenStorageKey, accessToken);
    sessionStorage.setItem(this.refreshTokenStorageKey, refreshToken);
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    sessionStorage.removeItem(this.accessTokenStorageKey);
    sessionStorage.removeItem(this.refreshTokenStorageKey);
  }

  private restoreSession(): void {
    const accessToken = sessionStorage.getItem(this.accessTokenStorageKey);
    const refreshToken = sessionStorage.getItem(this.refreshTokenStorageKey);

    if (!accessToken || !refreshToken) {
      this.clearSession();
      return;
    }

    const claims = this.decodeJwt(accessToken);
    if (!claims || this.isExpired(claims)) {
      this.clearSession();
      return;
    }

    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
  }

  private decodeJwt(token: string): JwtClaims | null {
    const [, payload] = token.split('.');
    if (!payload) return null;

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      return JSON.parse(atob(padded)) as JwtClaims;
    } catch {
      return null;
    }
  }

  private isExpired(claims: JwtClaims): boolean {
    if (!claims.exp) return false;
    return claims.exp * 1000 <= Date.now();
  }
}
