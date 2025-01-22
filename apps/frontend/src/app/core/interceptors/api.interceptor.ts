import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly baseUrl = 'http://localhost:3000';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith('http')) {
      const apiReq = req.clone({ url: `${this.baseUrl}${req.url}` });
      return next.handle(apiReq);
    }
    return next.handle(req);
  }
}
