import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-personal-info-dialog',
  templateUrl: './personal-info-dialog.component.html',
  styleUrls: ['./personal-info-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
})
export class PersonalInfoDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PersonalInfoDialogComponent>, private breakpointObserver: BreakpointObserver) { }
  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.adjustForMobile('90%', '75%');
      } else {
        this.adjustForMobile('40%', '50%');
      }
    });
  }

  private adjustForMobile(width: string, height: string): void {
    this.dialogRef.updateSize(width, height);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
