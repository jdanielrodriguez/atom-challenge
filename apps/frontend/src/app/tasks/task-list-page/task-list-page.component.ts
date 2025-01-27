import { Component, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { TaskDetailPageComponent } from '../task-detail-page/task-detail-page.component';
import { ConfirmDialogComponent, DEFAULT_DIALOG_CONFIG } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PersonalInfoDialogComponent } from '../../shared/components/personal-info-dialog/personal-info-dialog.component';
import { LogoutButtonComponent } from '../../shared/components/logout-button/logout-button.component';
import { UserMenuComponent } from '../../shared/components/user-menu-button/user-menu-button.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

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
    PersonalInfoDialogComponent,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss'],
})
export class TaskListPageComponent implements OnInit {
  tasks: Task[] = [];
  filtersForm: FormGroup;
  displayedColumns: string[] = ['title', 'createdAt', 'status', 'options'];
  statuses: string[] = Object.values(TaskStatus);
  totalTasks = 0;
  pageSize = 50;
  page = 1;
  filters = {
    status: '',
    search: '',
    dateRange: null as { startDate: Date | null; endDate: Date | null } | null
  };

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtersForm = this.fb.group({
      status: [''],
      search: [''],
      dateRange: this.fb.group({
        startDate: [null],
        endDate: [null],
      }),
    });
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks(): void {
    const formValues = this.filtersForm.value;

    const startDate = formValues.dateRange?.startDate
      ? this.toUtcStartOfDay(new Date(formValues.dateRange.startDate))
      : null;

    const endDate = formValues.dateRange?.endDate
      ? this.toUtcEndOfDay(new Date(formValues.dateRange.endDate))
      : null;

    const params = {
      status: formValues.status,
      search: formValues.search,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      page: this.page,
      pageSize: this.pageSize,
    };

    this.taskService.getTasks(params).subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.totalTasks = response.total;
      },
      error: (err) => console.error('Error fetching tasks:', err),
    });
  }

  private toUtcStartOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  }

  private toUtcEndOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchTasks();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.page = 1;
    this.fetchTasks();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchTasks();
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
