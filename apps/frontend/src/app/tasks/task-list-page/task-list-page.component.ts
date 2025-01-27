import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { TaskDetailPageComponent } from '../task-detail-page/task-detail-page.component';
import { ConfirmDialogComponent, DEFAULT_DIALOG_CONFIG } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PersonalInfoDialogComponent } from '../../shared/components/personal-info-dialog/personal-info-dialog.component';
import { LogoutButtonComponent } from '../../shared/components/logout-button/logout-button.component';
import { UserMenuComponent } from '../../shared/components/user-menu-button/user-menu-button.component';


@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    UserMenuComponent,
    MatDividerModule,
    MatSelectModule,
    LogoutButtonComponent,
    PersonalInfoDialogComponent
  ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss'],
})
export class TaskListPageComponent {
  tasks: Task[] = [];
  displayedColumns: string[] = ['title', 'createdAt', 'status', 'options'];
  statuses: string[] = Object.values(TaskStatus);

  constructor(
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

  onStatusChange(task: Task, newStatus: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        data: {
          title: 'Cambiar Estado',
          message: `¿Seguro que deseas cambiar el estado de "${task.title}" de "${task.status}" a "${newStatus}"?`,
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
        },
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        task.completed = false;
        if (newStatus === 'Completado') {
          task.completed = true;
        }
        task.status = Object.values(TaskStatus).includes(newStatus as TaskStatus) ? (newStatus as TaskStatus) : TaskStatus.Creado;
        this.taskService.updateTask(task).subscribe({
          next: () => console.log('Estado actualizado'),
          error: (err) => console.error('Error actualizando el estado', err),
        });
      }
    });
  }

  getFilteredStatuses(currentStatus: string): string[] {
    return this.statuses.filter((status) => status !== currentStatus);
  }

  addTask(): void {
    const dialogRef = this.dialog.open(TaskDetailPageComponent, {
      ...DEFAULT_DIALOG_CONFIG,
      ...{
        height: '60%',
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
        height: '65%',
        data: { task, readonly: true }
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

  openPersonalInfoDialog(): void {
    this.dialog.open(PersonalInfoDialogComponent, {
      ...DEFAULT_DIALOG_CONFIG,
    });
  }
}
