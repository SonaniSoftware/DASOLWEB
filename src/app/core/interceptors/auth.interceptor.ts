import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Shared across requests so concurrent 401s trigger only ONE refresh call.
let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}

/** Auth endpoints must never be retried/refreshed (avoids recursion). */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const authReq = withToken(req, auth.getToken());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const expired = error.status === 401 && error.error?.code === 'TOKEN_EXPIRED';

      if (expired && !isAuthEndpoint(req.url) && auth.getRefreshToken()) {
        return handleExpiredToken(req, next, auth);
      }

      return throwError(() => error);
    }),
  );
};

function handleExpiredToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
) {
  if (isRefreshing) {
    // A refresh is already in flight — wait for it, then retry with the new token.
    return refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(withToken(req, token))),
    );
  }

  isRefreshing = true;
  refreshedToken$.next(null);

  return auth.refreshAccessToken().pipe(
    switchMap((token) => {
      isRefreshing = false;
      refreshedToken$.next(token);
      return next(withToken(req, token));
    }),
    catchError((err) => {
      isRefreshing = false;
      auth.sessionExpired();
      return throwError(() => err);
    }),
  );
}
