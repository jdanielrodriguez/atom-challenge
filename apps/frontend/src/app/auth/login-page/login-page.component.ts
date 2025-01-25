import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogComponent, DEFAULT_DIALOG_CONFIG } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    MatDialogModule,
  ],
})
export class LoginPageComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [{ value: '', disabled: true }, Validators.required],
    });
  }

  onEmailBlur(): void {
    const emailControl = this.loginForm.get('email');

    if (emailControl && emailControl.valid) {
      const email = emailControl.value;
      if (email) {
        this.loading = true;
        this.authService
          .checkEmail(email)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (response) => {
              if (response.exists) {
                this.loginForm.get('password')?.enable();
              } else {
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                  ...DEFAULT_DIALOG_CONFIG,
                  ...{
                    data: {
                      title: 'Email no registrado',
                      message: '¿Deseas registrarte?',
                      confirmText: 'Sí',
                      cancelText: 'No',
                    },
                  },
                });

                dialogRef.afterClosed().subscribe((result) => {
                  if (result) {
                    this.registerUser(email);
                  }
                });
              }
            },
            error: (err) => console.error('Error verificando el email:', err),
          });
      }
    }
  }

  private registerUser(email: string): void {
    this.loading = true;
    this.authService
      .register({ email })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            ...DEFAULT_DIALOG_CONFIG,
            ...{
              data: {
                title: 'Usuario registrado',
                message: 'El usuario fue registrado correctamente. Por favor revisa tu correo.',
                confirmText: 'Aceptar',
              }
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.router.navigate(['/tasks']);
            }
          });
        },
        error: (err) => {
          console.error('Error registrando al usuario:', err);
          this.dialog.open(ConfirmDialogComponent, {
            ...DEFAULT_DIALOG_CONFIG,
            ...{
              data: {
                title: 'Error',
                message: 'Hubo un problema registrando el usuario. Por favor intenta de nuevo.',
                confirmText: 'Aceptar',
              }
            },
          });
        },
      });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (!password) {
        return;
      }
      this.loading = true;
      this.authService.login(email, password).pipe(
        finalize(() => (this.loading = false))
      ).subscribe({
        next: () => {
          this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
            if (isAuthenticated) {
              this.router.navigate(['/tasks']);
            }
          });
        },
        error: (err) => {
          console.error('Error en el login:', err);
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            ...DEFAULT_DIALOG_CONFIG,
            ...{
              data: {
                title: 'Error de inicio de sesión',
                message: 'No se pudo iniciar sesión. Por favor, verifica tus credenciales.',
                confirmText: 'Aceptar',
              }
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              const passwordControl = this.loginForm.get('password');
              if (passwordControl) {
                passwordControl.setValue('');
                passwordControl.markAsPristine();
                passwordControl.markAsUntouched();
              }
            }
          });
        },
      });
    } else {
      console.warn('Formulario no válido. Por favor, completa todos los campos requeridos.');
    }
  }
}
