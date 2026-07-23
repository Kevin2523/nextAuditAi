import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) throw error;
      if (req.url === '/api/v1/auth/refresh') throw error;
      if (req.url === '/api/v1/auth/login') throw error;

      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) throw error;

      return auth.refreshToken().pipe(
        switchMap(() => {
          const newToken = auth.accessToken();
          if (!newToken) throw error;

          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            }),
          );
        }),
        catchError(() => throwError(() => error)),
      );
    }),
  );
};
