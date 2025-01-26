import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';
import { AuthService } from '../../../core/services/auth.service';
import { DEFAULT_DIALOG_CONFIG } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-menu-button',
  standalone: true,
  templateUrl: './user-menu-button.component.html',
  styleUrls: ['./user-menu-button.component.scss'],
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    LogoutButtonComponent,
  ],
})
export class UserMenuComponent implements OnInit {
  userImage = 'https://robohash.org/68.186.255.198.png';
  userName = '';

  constructor(private dialog: MatDialog, private authService: AuthService) { }
  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Usuario';
  }
  openChangePasswordDialog(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        panelClass: 'change-password-dialog-container',
        height: '50%',
      }
    });
  }
}
