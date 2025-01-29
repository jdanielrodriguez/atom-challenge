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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { provideMatPaginatorIntl } from '../../shared/providers/custom-paginator-intl.component';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { TaskDetailPageComponent } from '../task-detail-page/task-detail-page.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PersonalInfoDialogComponent } from '../../shared/components/personal-info-dialog/personal-info-dialog.component';
import { LogoutButtonComponent } from '../../shared/components/logout-button/logout-button.component';
import { UserMenuComponent } from '../../shared/components/user-menu-button/user-menu-button.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

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
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    provideMatPaginatorIntl
  ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss'],
})
export class TaskListPageComponent implements OnInit {
  tasks: Task[] = [this.cleanTable()];
  filtersForm: FormGroup;
  displayedColumns: string[] = ['title', 'createdAt', 'status', 'options'];
  statuses = Object.values(TaskStatus);
  totalTasks = 0;
  pageSize = 50;
  page = 1;
  isLoading = false;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtersForm = this.fb.group({
      status: [''],
      search: [''],
      dateRange: this.fb.group({ startDate: [null], endDate: [null] }),
    });
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  async fetchTasks(): Promise<void> {
    this.isLoading = true;
    this.tasks = [this.cleanTable()];
    try {
      const { status, search, dateRange } = this.filtersForm.value;
      const params = {
        status,
        search,
        ...this.formatDateRange(dateRange),
        page: this.page,
        pageSize: this.pageSize,
      };

      const response = await lastValueFrom(this.taskService.getTasks(params));
      this.tasks = response.tasks;
      this.totalTasks = response.total;
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      this.isLoading = false;
    }
  }

  formatDateRange(dateRange: any): { startDate: string | null; endDate: string | null } {
    if (!dateRange?.startDate || !dateRange?.endDate) return { startDate: null, endDate: null };

    return {
      startDate: this.toUtcStartOfDay(new Date(dateRange.startDate)).toISOString(),
      endDate: this.toUtcEndOfDay(new Date(dateRange.endDate)).toISOString(),
    };
  }

  toUtcStartOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  }

  toUtcEndOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchTasks();
  }

  clearFilters(): void {
    this.filtersForm.reset({ status: '', search: '', dateRange: { startDate: null, endDate: null } });
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
    this.taskService.updateTask(updatedTask).subscribe(() => this.fetchTasks());
  }

  async onStatusChange(task: Task, newStatus: TaskStatus): Promise<void> {
    const dialogRef = this.openDialog(ConfirmDialogComponent, {
      data: {
        title: 'Cambiar Estado',
        message: `¿Seguro que deseas cambiar el estado de "${task.title}" de "${task.status}" a "${newStatus}"?`,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        beforeClose: async () => {
          task.completed = newStatus === TaskStatus.Completado;
          await lastValueFrom(this.taskService.updateTask({ ...task, status: newStatus }));
          await this.fetchTasks();
        },
      },
    });

    await lastValueFrom(dialogRef.afterClosed());
  }

  getFilteredStatuses(currentStatus: string): string[] {
    return this.statuses.filter((status) => status !== currentStatus);
  }

  async addTask(): Promise<void> {
    await this.openDialogWithFetch(TaskDetailPageComponent, { height: '60%' });
  }

  async editTask(task: Task): Promise<void> {
    await this.openDialogWithFetch(TaskDetailPageComponent, { height: '65%', data: { task, readonly: true } });
  }

  async deleteTask(task: Task): Promise<void> {
    const dialogRef = this.openDialog(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar tarea',
        message: `¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        beforeClose: async () => {
          if (task.id) {
            await lastValueFrom(this.taskService.deleteTask(task.id));
            await this.fetchTasks();
          }
        },
      },
    });

    await lastValueFrom(dialogRef.afterClosed());
  }

  async openDialogWithFetch(component: any, config: any = {}) {
    const dialogRef = this.openDialog(component, config);
    await lastValueFrom(dialogRef.afterClosed());
    await this.fetchTasks();
  }

  openPersonalInfoDialog(): void {
    this.openDialog(PersonalInfoDialogComponent);
  }

  private openDialog(component: any, config: any = {}) {
    return this.dialog.open(component, config);
  }

  cleanTable() {
    return { title: 'loading', description: 'loading', status: TaskStatus.Creado, createdAt: new Date(), completed: false }
  }
}
