import helmet from 'helmet';
import type { INestApplication } from '@nestjs/common';

export function configureHelmet(app: INestApplication): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'fonts.gstatic.com', 'data:'],
          connectSrc: ["'self'", 'ws://localhost:*', 'wss://*.ngrok.io'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );
}
