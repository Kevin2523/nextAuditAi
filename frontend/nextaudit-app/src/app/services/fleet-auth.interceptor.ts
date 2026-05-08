import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { FleetTokenService } from './fleet-token.service';

export const fleetAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenSvc = inject(FleetTokenService);
  const isFleetRequest = req.url.includes('/api/v1/fleet') || req.url.includes('localhost:1337');
  const isFleetLogin = req.url.includes('/api/v1/fleet/login');

  if (isFleetRequest && !isFleetLogin && tokenSvc.fleetToken) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${tokenSvc.fleetToken}` },
    });
    return next(cloned);
  }

  const isN8nRequest =
    req.url.includes('/api/n8n') || req.url.includes('/rest') || req.url.includes('localhost:5678');

  if (isN8nRequest) {
    const headers = tokenSvc.n8nToken ? { 'X-N8N-API-KEY': tokenSvc.n8nToken } : undefined;
    const cloned = req.clone({
      withCredentials: true,
      ...(headers ? { setHeaders: headers } : {}),
    });
    return next(cloned);
  }

  return next(req);
};
