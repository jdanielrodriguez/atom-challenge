import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly whitelist = ['/auth/login', '/auth/register'];

  constructor(private router: Router, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const fullUrl = req.url.startsWith('http') ? req.url : `${this.baseUrl}${req.url}`;

    if (this.isWhitelisted(fullUrl)) {
      return next.handle(req.clone({ url: fullUrl })).pipe(catchError((error) => this.handleError(error)));
    }

    const token = this.authService.getToken();
    const authReq = token
      ? req.clone({
        url: fullUrl,
        setHeaders: { Authorization: `Bearer ${token}` },
      })
      : req.clone({ url: fullUrl });

    return next.handle(authReq).pipe(catchError((error) => this.handleError(error)));
  }

  private isWhitelisted(url: string): boolean {
    return this.whitelist.some((endpoint) => url.includes(endpoint));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 && error.error?.details?.code === 'auth/id-token-expired') {
      console.warn('Token expirado, cerrando sesión.');
      return this.authService.logout().pipe(
        tap(() => this.router.navigate(['/auth/login'])),
        catchError((err) => {
          console.error('Error cerrando sesión:', err);
          this.authService.cleanUpSession();
          return throwError(() => new Error(err.message));
        }),
        switchMap(() => throwError(() => new Error('Token expirado')))
      );
    }

    if (error.status === 401) {
      console.error('Solicitud no autorizada:', error.message);
    } else {
      console.error('Error en la solicitud:', error.message);
    }

    return throwError(() => new Error(error.message));
  }
}
