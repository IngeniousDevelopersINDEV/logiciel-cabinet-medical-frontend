import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Intercepteur d'erreurs - gère les erreurs HTTP globalement
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('auth/login')) {
          return this.handle401Error(req, next);
        }

        if (error.status === 403) {
          this.notificationService.error('Accès refusé');
        } else if (error.status === 0) {
          this.notificationService.error('Impossible de contacter le serveur');
        } else if (error.status >= 500) {
          this.notificationService.error('Erreur serveur. Veuillez réessayer plus tard.');
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${response.token}` }
          });
          return next.handle(authReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }
    return next.handle(req);
  }
}
