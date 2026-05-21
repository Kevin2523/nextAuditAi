import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const fleetAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const isNextAuditApi = req.url.startsWith('/api/v1/');
  const isLogin = req.url === '/api/v1/auth/login';

  if (token && isNextAuditApi && !isLogin) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  return next(req);
};
