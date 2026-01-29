import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const adminService = inject(AdminService);
  const router = inject(Router);

  // Skip auth APIs
  if (req.url.includes('admin-auth')) {
    return next(req);
  }

  const accessToken = localStorage.getItem('accessToken');

  // Attach token
  const authReq = accessToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // If token expired
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return adminService.refreshToken().pipe(
          switchMap((res: any) => {
            isRefreshing = false;

            // Save new token
            localStorage.setItem('accessToken', res.accessToken);

            // Retry failed request
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`,
              },
            });

            return next(retryReq);
          }),
          catchError(() => {
            isRefreshing = false;

            // Refresh failed → logout
            adminService.forceLogout();
            router.navigate(['/login']);

            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
