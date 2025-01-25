import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [MatButtonModule],
  template: `<button mat-raised-button color="warn" (click)="logout()">Cerrar sesión</button>`,
  styles: [],
})
export class LogoutButtonComponent {
  constructor(private authService: AuthService, private router: Router) { }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Error durante el cierre de sesión:', err);
      },
    });
  }
}
