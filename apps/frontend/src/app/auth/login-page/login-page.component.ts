import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DEFAULT_DIALOG_CONFIG } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
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
                    this.router.navigate(['/auth/register']);
                  }
                });
              }
            },
            error: (err) => console.error('Error verificando el email:', err),
          });
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.loading = true;
      this.authService
        .login(email, password)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigate(['/tasks']),
          error: (err) => console.error('Error en el login:', err),
        });
    }
  }
}
