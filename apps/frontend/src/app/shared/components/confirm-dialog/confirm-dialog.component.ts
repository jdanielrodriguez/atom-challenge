import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export const DEFAULT_DIALOG_CONFIG: MatDialogConfig = {
  width: '40%',
  height: '40%',
  maxHeight: '90vh',
  panelClass: 'custom-dialog-container',
};

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  standalone: true,
  imports: [MatIconModule, NgIf, MatProgressSpinnerModule],
})
export class ConfirmDialogComponent implements OnInit {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText: string;
      cancelText?: string;
      beforeClose?: () => Promise<void>;
    },
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.adjustForMobile('80%', '50%');
      } else {
        this.adjustForMobile(DEFAULT_DIALOG_CONFIG.width || '40%', DEFAULT_DIALOG_CONFIG.height || '40%');
      }
    });
  }

  private adjustForMobile(width: string, height: string): void {
    this.dialogRef.updateSize(width, height);
  }

  async onConfirm(): Promise<void> {
    if (this.data.beforeClose) {
      this.isLoading = true;
      try {
        await this.data.beforeClose();
      } finally {
        this.isLoading = false;
        this.dialogRef.close(true);
      }
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
