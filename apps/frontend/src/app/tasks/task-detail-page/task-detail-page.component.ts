import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskFormComponent } from '../task-form/task-form.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [TaskFormComponent],
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
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; readonly: boolean },
    private breakpointObserver: BreakpointObserver

  ) { }

  ngOnInit(): void {
    this.isReadonly = this.data?.readonly || false;
    this.task = this.data?.task || null;
    this.isEditMode = !!this.task?.id;
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.adjustForMobile('80%', '60%');
      } else {
        this.adjustForMobile('40%', '75%');
      }
    });
  }

  private adjustForMobile(width: string, height: string): void {
    this.dialogRef.updateSize(width, height);
  }

  onSave(task: Task): void {
    this.isLoading = true;

    if (task.id) {
      this.updateTask(task);
    } else {
      this.createTask(task);
    }
  }

  private createTask(task: Task): void {
    this.taskService.addTask(task).subscribe({
      next: (newTask) => {
        this.snackBar.open('Tarea creada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(newTask);
      },
      error: () => {
        this.snackBar.open('Error creando la tarea', 'Cerrar', { duration: 3000 });
      },
      complete: () => (this.isLoading = false),
    });
  }

  private updateTask(task: Task): void {
    this.taskService.updateTask(task).subscribe({
      next: () => {
        this.snackBar.open('Tarea actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(task);
      },
      error: () => {
        this.snackBar.open('Error actualizando la tarea', 'Cerrar', { duration: 3000 });
      },
      complete: () => (this.isLoading = false),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
