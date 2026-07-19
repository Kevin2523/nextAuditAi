import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

export type UserRole = 'viewer' | 'admin' | 'super_admin';
export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  displayName?: string;
  exp?: number;
  iat?: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  displayName?: string;
  isMfaEnabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    tenantId: string;
    isMfaEnabled?: boolean;
  };
}

export interface LoginMfaRequiredResponse {
  mfaRequired: true;
  tempToken: string;
  hasMfaTotp?: boolean;
  hasPasskeys?: boolean;
}

export type LoginResponse = LoginSuccessResponse | LoginMfaRequiredResponse;
export type LoginOutcome =
  | { kind: 'authenticated'; user: CurrentUser }
  | { kind: 'mfa-required'; tempToken: string; hasMfaTotp: boolean; hasPasskeys: boolean };

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface MfaEnableRequest {
  otp: string;
}

export interface MfaLoginRequest {
  tempToken: string;
  otp: string;
}

export interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface PasskeyRegisterBeginResponse {
  sessionId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
  deviceName?: string;
}

export interface PasskeyRegisterCompleteResponse {
  message: string;
}

export interface PasskeyLoginBeginResponse {
  sessionId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

export interface PasskeyInfo {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenStorageKey = 'nextaudit.access_token';
  private readonly refreshTokenStorageKey = 'nextaudit.refresh_token';
  private readonly mfaEnabledStorageKeyPrefix = 'nextaudit.mfa_enabled.';
  private readonly pendingMfaTokenStorageKey = 'nextaudit.pending_mfa_token';
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);
  private readonly pendingMfaTokenSignal = signal<string | null>(null);
  private readonly mfaEnabledSignal = signal(false);

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
      displayName: claims.displayName,
      isMfaEnabled: this.mfaEnabledSignal(),
    };
  });

  readonly isAuthenticated = computed(() => Boolean(this.currentUserSignal()));
  readonly role = computed(() => this.currentUserSignal()?.role ?? null);
  readonly canUseAi = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'super_admin';
  });
  readonly hasMfaEnabled = computed(() => this.mfaEnabledSignal());

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<LoginOutcome> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', credentials).pipe(
      tap((response) => {
        if ('mfaRequired' in response) {
          this.clearSession();
          this.pendingMfaTokenSignal.set(response.tempToken);
          sessionStorage.setItem(this.pendingMfaTokenStorageKey, response.tempToken);
          return;
        }

        this.storeSession(response.accessToken, response.refreshToken, response.user.id, Boolean(response.user.isMfaEnabled));
      }),
      map((response) => {
        if ('mfaRequired' in response) {
          return { kind: 'mfa-required', tempToken: response.tempToken, hasMfaTotp: response.hasMfaTotp ?? false, hasPasskeys: response.hasPasskeys ?? false } as const;
        }

        const user = this.currentUserSignal();
        if (!user) {
          throw new Error('No se pudo iniciar la sesion.');
        }

        return { kind: 'authenticated', user } as const;
      }),
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/forgot-password', payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/reset-password', payload);
  }

  generateMfa(): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>('/api/v1/auth/mfa/generate', {});
  }

  enableMfa(payload: MfaEnableRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/mfa/enable', payload).pipe(
      tap(() => this.setMfaEnabledForCurrentUser(true)),
    );
  }

  disableMfa(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/mfa/disable', {}).pipe(
      tap(() => this.setMfaEnabledForCurrentUser(false)),
    );
  }

  verifyMfaLogin(payload: MfaLoginRequest): Observable<CurrentUser> {
    return this.http.post<LoginSuccessResponse>('/api/v1/auth/login/mfa-verify', payload).pipe(
      tap((response) => {
        this.storeSession(response.accessToken, response.refreshToken, response.user.id, true);
        this.pendingMfaTokenSignal.set(null);
        sessionStorage.removeItem(this.pendingMfaTokenStorageKey);
      }),
      map(() => {
        const user = this.currentUserSignal();
        if (!user) {
          throw new Error('No se pudo completar la verificacion MFA.');
        }
        return user;
      }),
    );
  }

  passkeyRegisterBegin(deviceName?: string, authenticatorAttachment?: 'platform' | 'cross-platform'): Observable<PasskeyRegisterBeginResponse> {
    return this.http.post<PasskeyRegisterBeginResponse>('/api/v1/auth/passkey/register/begin', { deviceName, authenticatorAttachment });
  }

  passkeyRegisterComplete(sessionId: string, response: unknown, deviceName?: string): Observable<PasskeyRegisterCompleteResponse> {
    return this.http.post<PasskeyRegisterCompleteResponse>('/api/v1/auth/passkey/register/complete', {
      sessionId,
      ...(response as Record<string, unknown>),
      deviceName,
    });
  }

  passkeyLoginBegin(email: string): Observable<PasskeyLoginBeginResponse> {
    return this.http.post<PasskeyLoginBeginResponse>('/api/v1/auth/passkey/login/begin', { email });
  }

  passkeyLoginComplete(sessionId: string, response: unknown): Observable<LoginSuccessResponse> {
    return this.http.post<LoginSuccessResponse>('/api/v1/auth/passkey/login/complete', {
      sessionId,
      ...(response as Record<string, unknown>),
    }).pipe(
      tap((loginResponse) => {
        this.storeSession(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.user.id);
      }),
    );
  }

  passkeyMfaLoginBegin(tempToken: string): Observable<PasskeyLoginBeginResponse> {
    return this.http.post<PasskeyLoginBeginResponse>('/api/v1/auth/login/mfa-passkey-begin', { tempToken });
  }

  passkeyMfaLoginComplete(sessionId: string, response: unknown, tempToken: string): Observable<LoginSuccessResponse> {
    return this.http.post<LoginSuccessResponse>('/api/v1/auth/login/mfa-passkey-complete', {
      sessionId,
      tempToken,
      ...(response as Record<string, unknown>),
    }).pipe(
      tap((loginResponse) => {
        this.storeSession(loginResponse.accessToken, loginResponse.refreshToken, loginResponse.user.id);
      }),
    );
  }

  listPasskeys(): Observable<PasskeyInfo[]> {
    return this.http.get<PasskeyInfo[]>('/api/v1/auth/passkey');
  }

  deletePasskey(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/v1/auth/passkey/${id}`);
  }

  updateProfile(dto: { displayName?: string; email?: string; currentPassword: string }): Observable<LoginSuccessResponse & { reauthenticate?: boolean }> {
    return this.http.patch<LoginSuccessResponse & { reauthenticate?: boolean }>('/api/v1/auth/profile', dto).pipe(
      tap((response) => {
        this.storeSession(response.accessToken, response.refreshToken, response.user.id, Boolean(response.user.isMfaEnabled));
      }),
    );
  }

  changePassword(dto: { currentPassword: string; newPassword: string }): Observable<LoginSuccessResponse & { reauthenticate?: boolean }> {
    return this.http.post<LoginSuccessResponse & { reauthenticate?: boolean }>('/api/v1/auth/change-password', dto).pipe(
      tap((response) => {
        this.storeSession(response.accessToken, response.refreshToken, response.user.id, Boolean(response.user.isMfaEnabled));
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  accessToken(): string | null {
    return this.accessTokenSignal();
  }

  pendingMfaToken(): string | null {
    return this.pendingMfaTokenSignal();
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const role = this.role();
    return Boolean(role && roles.includes(role));
  }

  private storeSession(accessToken: string, refreshToken: string, userId: string, mfaEnabled = false): void {
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    this.mfaEnabledSignal.set(mfaEnabled);
    sessionStorage.setItem(this.accessTokenStorageKey, accessToken);
    sessionStorage.setItem(this.refreshTokenStorageKey, refreshToken);
    sessionStorage.setItem(this.mfaEnabledStorageKeyForUser(userId), String(mfaEnabled));
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.pendingMfaTokenSignal.set(null);
    this.mfaEnabledSignal.set(false);
    sessionStorage.removeItem(this.accessTokenStorageKey);
    sessionStorage.removeItem(this.refreshTokenStorageKey);
    sessionStorage.removeItem(this.pendingMfaTokenStorageKey);
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
    this.pendingMfaTokenSignal.set(sessionStorage.getItem(this.pendingMfaTokenStorageKey));
    this.mfaEnabledSignal.set(sessionStorage.getItem(this.mfaEnabledStorageKeyForUser(claims.sub)) === 'true');
  }

  private setMfaEnabledForCurrentUser(enabled: boolean): void {
    const user = this.currentUserSignal();
    if (!user) return;

    this.mfaEnabledSignal.set(enabled);
    sessionStorage.setItem(this.mfaEnabledStorageKeyForUser(user.id), String(enabled));
  }

  private mfaEnabledStorageKeyForUser(userId: string): string {
    return `${this.mfaEnabledStorageKeyPrefix}${userId}`;
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
