import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    CommonModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.scss'],
})
export class TaskDetailPageComponent implements OnInit {
  taskForm!: FormGroup;
  taskId: string | null = null;
  isLoading = false;
  isEditMode: boolean = false;
  statuses: TaskStatus[] = Object.values(TaskStatus);

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskDetailPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null, readonly: boolean }
  ) { }

  ngOnInit(): void {
    const isReadonly = this.data?.readonly || false;
    this.initForm(isReadonly);

    if (this.data?.task) {
      this.taskId = this.data.task.id || null;
      this.isEditMode = !!this.taskId;
      this.taskForm.patchValue(this.data.task);
    }
  }

  private initForm(isReadonly: boolean = false): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      status: [{ value: TaskStatus.Creado, disabled: isReadonly }],
      completed: [{ value: false, disabled: isReadonly }],
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const taskData: Task = {
      ...this.taskForm.value,
      id: this.taskId || undefined,
    };

    if (this.taskId) {
      this.updateTask(taskData);
    } else {
      this.createTask(taskData);
    }
  }

  private createTask(task: Task): void {
    this.isLoading = true;
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
    this.isLoading = true;
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

  getFilteredStatuses(currentStatus: string): string[] {
    return this.statuses.filter((status) => status !== currentStatus && status !== TaskStatus.Completado);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
