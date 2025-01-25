import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly whitelist = ['/auth/login', '/auth/register'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const fullUrl = req.url.startsWith('http') ? req.url : `${this.baseUrl}${req.url}`;

    if (this.isWhitelisted(fullUrl)) {
      const apiReq = req.clone({ url: fullUrl });
      return next.handle(apiReq);
    }

    const token = localStorage.getItem('token');
    if (token) {
      const authReq = req.clone({
        url: fullUrl,
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(authReq);
    } else {
      console.warn('No se encontró token para solicitud segura.');
    }

    return next.handle(req.clone({ url: fullUrl }));
  }

  private isWhitelisted(url: string): boolean {
    return this.whitelist.some((endpoint) => url.includes(endpoint));
  }
}
