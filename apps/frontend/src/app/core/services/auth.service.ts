import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { User } from '../../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private firebaseService: FirebaseService) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private updateAuthState(token: string | null): void {
    if (token) {
      localStorage.setItem('token', token);
      this.isAuthenticatedSubject.next(true);
    } else {
      localStorage.removeItem('token');
      this.isAuthenticatedSubject.next(false);
    }
  }

  private processAuthentication(token: string): void {
    this.firebaseService
      .signInWithToken(token)
      .then(() => this.firebaseService.getIdToken())
      .then((idToken) => this.updateAuthState(idToken))
      .catch((err) => console.error('Error during Firebase authentication:', err));
  }

  checkEmail(email: string): Observable<any> {
    return this.http.post('/api/auth/check-email', { email }).pipe(catchError(this.handleError));
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password }).pipe(
      tap((response: any) => this.processAuthentication(response.token)),
      catchError(this.handleError)
    );
  }

  register(user: { email: string }): Observable<User> {
    return this.http.post(`/api/auth/register`, user).pipe(
      tap((response: any) => this.processAuthentication(response.token)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('token');
      }),
      catchError((error) => {
        console.error('Error cerrando sesión:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
