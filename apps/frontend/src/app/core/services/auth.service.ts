import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError, tap } from 'rxjs';
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

  checkEmail(email: string): Observable<any> {
    return this.http.post('/api/auth/check-email', { email }).pipe(
      catchError(this.handleError)
    );
  }

  private async handleCustomToken(customToken: string): Promise<void> {
    const userCredential = await this.firebaseService.signInWithToken(customToken);
    const idToken = await this.firebaseService.getIdToken();
    this.setToken(idToken);
    this.isAuthenticatedSubject.next(true);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password }).pipe(
      tap(async (response: any) => {
        await this.handleCustomToken(response.token);
      }),
      catchError(this.handleError)
    );
  }

  register(user: { email: string }): Observable<User> {
    return this.http.post(`/api/auth/register`, user).pipe(
      tap(async (response: any) => {
        await this.handleCustomToken(response.token);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.isAuthenticatedSubject.next(true);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      },
    });
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
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
