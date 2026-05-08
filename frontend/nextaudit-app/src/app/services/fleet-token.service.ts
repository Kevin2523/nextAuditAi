import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FleetTokenService {
  
  get fleetToken(): string | null {
    return localStorage.getItem('fleet_token') ?? null;
  }

  setFleetToken(t: string) {
    localStorage.setItem('fleet_token', t);
  }

  get n8nToken(): string | null {
    return localStorage.getItem('n8n_token') ?? null;
  }

  setN8nToken(t: string) {
    localStorage.setItem('n8n_token', t);
  }

  clearTokens() {
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('n8n_token');
  }
}
