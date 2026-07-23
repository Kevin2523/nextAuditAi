export interface IdsSignature {
  name: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block';
}

export const IDS_SIGNATURES: Record<string, IdsSignature> = {
  PATH_SCANNING: {
    name: 'PATH_SCANNING',
    description: 'Escaneo de rutas - multiples 404 en poco tiempo',
    severity: 'medium',
    action: 'block',
  },
  BRUTE_FORCE: {
    name: 'BRUTE_FORCE',
    description: 'Fuerza bruta por IP - multiples intentos de login fallidos',
    severity: 'high',
    action: 'block',
  },
  SUSPICIOUS_UA: {
    name: 'SUSPICIOUS_UA',
    description: 'User-Agent de herramienta de ataque conocido',
    severity: 'high',
    action: 'block',
  },
  PAYLOAD_ANOMALY: {
    name: 'PAYLOAD_ANOMALY',
    description: 'Cuerpo de request anormalmente grande',
    severity: 'medium',
    action: 'log',
  },
  RATE_ABUSE: {
    name: 'RATE_ABUSE',
    description: 'Abuso de tasa - demasiadas requests desde misma IP',
    severity: 'medium',
    action: 'block',
  },
};

export const MAX_404_PER_IP = 15;
export const MAX_FAILED_LOGIN_PER_IP = 10;
export const MAX_REQUESTS_PER_IP = 100;
export const WINDOW_MS = 60_000;
export const BLOCK_DURATION_MS = 15 * 60_000;
export const MAX_PAYLOAD_SIZE = 100_000;
