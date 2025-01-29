import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { lastValueFrom } from 'rxjs';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { TaskService } from '../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [TaskFormComponent, MatProgressSpinnerModule, CommonModule],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss'],
})
export class TaskDetailPageComponent implements OnInit {
  task: Task | null = null;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  statuses: TaskStatus[] = Object.values(TaskStatus);
  isReadonly: boolean = false;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskDetailPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; readonly: boolean; beforeClose?: () => Promise<void> },
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.isReadonly = this.data?.readonly || false;
    this.task = this.data?.task || null;
    this.isEditMode = !!this.task?.id;

    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.adjustForMobile('80%', '75%');
      } else {
        this.adjustForMobile('40%', '60%');
      }
    });
  }

  private adjustForMobile(width: string, height: string): void {
    this.dialogRef.updateSize(width, height);
  }

  async onSave(task: Task): Promise<void> {
    this.isLoading = true;

    try {
      if (task.id) {
        await lastValueFrom(this.taskService.updateTask(task));
        this.snackBar.open('Tarea actualizada correctamente', 'Cerrar', { duration: 3000 });
      } else {
        const newTask = await lastValueFrom(this.taskService.addTask(task));
        this.snackBar.open('Tarea creada correctamente', 'Cerrar', { duration: 3000 });
      }

      if (this.data.beforeClose) {
        await this.data.beforeClose();
      }

      this.dialogRef.close(task);
    } catch (error) {
      this.snackBar.open('Error al guardar la tarea', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
