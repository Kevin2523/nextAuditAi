import { Injectable } from '@angular/core';
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';

export interface PasskeyInfo {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class WebAuthnService {
  isSupported(): boolean {
    return browserSupportsWebAuthn();
  }

  async register(options: PublicKeyCredentialCreationOptionsJSON): Promise<RegistrationResponseJSON> {
    return startRegistration(options);
  }

  async authenticate(options: PublicKeyCredentialRequestOptionsJSON): Promise<AuthenticationResponseJSON> {
    return startAuthentication(options);
  }
}
