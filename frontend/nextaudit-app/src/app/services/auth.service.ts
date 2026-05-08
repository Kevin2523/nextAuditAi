import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { FleetLoginRequest, FleetService } from './fleet.service';
import { FleetTokenService } from './fleet-token.service';

export interface N8nLoginRequest {
  emailOrLdapLoginId: string;
  password: string;
}

export interface LoginAllRequest {
  fleet: FleetLoginRequest;
  n8n: N8nLoginRequest;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(FleetTokenService);
  private readonly fleetService = inject(FleetService);

  loginAll(credentials: LoginAllRequest): Observable<unknown> {
    return forkJoin({
      fleet: this.loginFleet(credentials.fleet).pipe(catchError(() => of(null))),
      n8n: this.loginN8n(credentials.n8n).pipe(catchError(() => of(null))),
    });
  }

  loginFleet(credentials: FleetLoginRequest): Observable<string | null> {
    return this.fleetService.login(credentials).pipe(
      tap((token) => {
        if (token) {
          this.tokenService.setFleetToken(token);
        }
      }),
      map((token) => token ?? null),
    );
  }

  loginN8n(credentials: N8nLoginRequest): Observable<string | null> {
    return this.http.post<{ data?: { token?: string } }>('/rest/login', credentials, { withCredentials: true }).pipe(
      tap((res) => {
        const token = res?.data?.token;
        if (token) {
          this.tokenService.setN8nToken(token);
        }
      }),
      map((res) => res?.data?.token ?? null),
      catchError(() => of(null)),
    );
  }
}
