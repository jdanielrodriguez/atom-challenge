import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule],
})
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
    });
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
    if (newPassword !== confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        console.log('Contraseña actualizada.');
        this.dialogRef.close();
      },
      error: (err) => {
        console.error('Error al cambiar la contraseña:', err);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
