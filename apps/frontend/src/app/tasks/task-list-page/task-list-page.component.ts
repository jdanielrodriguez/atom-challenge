import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../interfaces/task.interface';
import { TaskDetailPageComponent } from '../task-detail-page/task-detail-page.component';
import { ConfirmDialogComponent, DEFAULT_DIALOG_CONFIG } from '../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss'],
})
export class TaskListPageComponent {
  tasks: Task[] = [];
  displayedColumns: string[] = ['title', 'description', 'createdAt', 'status', 'options'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {
    this.fetchTasks();
  }

  fetchTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => (this.tasks = tasks),
      error: (err) => console.error('Error fetching tasks:', err),
    });
  }

  toggleTaskStatus(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(updatedTask).subscribe({
      next: () => {
        this.tasks = this.tasks.map((t) => (t.id === task.id ? updatedTask : t));
      },
      error: (err) => console.error('Error updating task status:', err),
    });
  }

  addTask(): void {
    const dialogRef = this.dialog.open(TaskDetailPageComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        height: '70%',
        data: { mode: 'create' },
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchTasks();
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailPageComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        height: '80%',
        data: { mode: 'edit', task }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchTasks();
      }
    });
  }

  deleteTask(task: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        data: {
          title: 'Eliminar tarea',
          message: `¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
        },
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => { this.fetchTasks(); dialogRef.close(); },
          error: (err) => console.error('Error al eliminar la tarea:', err),
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err) => console.error('Error during logout:', err),
    });
  }
}
