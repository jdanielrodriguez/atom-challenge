import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly whitelist = ['/auth/login', '/auth/register'];

  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const fullUrl = req.url.startsWith('http') ? req.url : `${this.baseUrl}${req.url}`;

    if (this.isWhitelisted(fullUrl)) {
      const apiReq = req.clone({ url: fullUrl });
      return next.handle(apiReq).pipe(catchError((error) => this.handleError(error)));
    }

    const token = localStorage.getItem('token');
    if (token) {
      const authReq = req.clone({
        url: fullUrl,
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(authReq).pipe(catchError((error) => this.handleError(error)));
    } else {
      console.warn('No se encontró token para solicitud segura.');
    }

    return next.handle(req.clone({ url: fullUrl })).pipe(catchError((error) => this.handleError(error)));
  }

  private isWhitelisted(url: string): boolean {
    return this.whitelist.some((endpoint) => url.includes(endpoint));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 && error.error?.details.code === 'auth/id-token-expired') {
      console.warn('Token expirado, cerrando sesión.');
      localStorage.removeItem('token');
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 1000);
    } else if (error.status === 401) {
      console.error('Solicitud no autorizada:', error.message);
    } else {
      console.error('Error en la solicitud:', error.message);
    }
    return throwError(() => new Error(error.message));
  }
}
