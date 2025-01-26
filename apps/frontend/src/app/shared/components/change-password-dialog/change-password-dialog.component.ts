import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule, MatProgressSpinnerModule],
})
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
      {
        validators: this.passwordsMatchValidator,
      });
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (confirmPassword?.length > 0 && confirmPassword?.length < 8) {
      group.get('confirmPassword')?.setErrors({ confirmPasswordTooShort: true });
      return { confirmPasswordTooShort: true };
    }

    if (confirmPassword?.length >= 8 && newPassword !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    group.get('confirmPassword')?.setErrors(null);
    return null;
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isLoading = true;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada.', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
        this.dialogRef.close();
      },
      error: (err: Error) => {
        this.snackBar.open(err.message || 'Error al cambiar la contraseña.', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
