import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { jwtDecode } from 'jwt-decode';
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
      this.cleanUpSession();
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

  resetPassword(email: string): Observable<any> {
    return this.http.post('/api/auth/reset-password', { email }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => {
        this.cleanUpSession();
      }),
      catchError((error) => {
        console.warn('Error cerrando sesión, limpiando sesión localmente:', error.message);
        this.cleanUpSession();
        return throwError(() => new Error('Error cerrando sesión'));
      })
    );
  }

  cleanUpSession(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
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

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post('/api/auth/change-password', { currentPassword, newPassword }).pipe(
      tap((response: any) => this.processAuthentication(response.token)),
      catchError(this.handleError)
    );
  }

  getDecodedToken(): any {
    const token = this.getToken();
    try {
      return token ? jwtDecode(token) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserName(): string | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.email || null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
