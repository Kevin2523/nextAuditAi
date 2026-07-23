import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

export const ThrottlerConfig = ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,
    limit: 10,
  },
  {
    name: 'medium',
    ttl: 10000,
    limit: 50,
  },
  {
    name: 'long',
    ttl: 60000,
    limit: 100,
  },
]);

export const ThrottlerGuardProvider = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};
