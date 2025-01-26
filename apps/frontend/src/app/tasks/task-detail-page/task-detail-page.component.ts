import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskFormComponent } from '../task-form/task-form.component';

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
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; readonly: boolean }
  ) { }

  ngOnInit(): void {
    this.isReadonly = this.data?.readonly || false;
    this.task = this.data?.task || null;
    this.isEditMode = !!this.task?.id;
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
