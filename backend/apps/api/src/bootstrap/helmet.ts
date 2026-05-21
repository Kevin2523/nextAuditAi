import helmet from 'helmet';
import type { INestApplication } from '@nestjs/common';

export function configureHelmet(app: INestApplication): void {
  app.use(helmet());
}
