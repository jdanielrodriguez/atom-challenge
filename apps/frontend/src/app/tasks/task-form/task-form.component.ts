import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../interfaces/task.interface';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-task-form',
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
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() statuses: TaskStatus[] = Object.values(TaskStatus);
  @Input() readonly: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() save = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      status: [{value: TaskStatus.Creado, disabled: this.task?.completed}, Validators.required],
      completed: [{ value: false, disabled: true }],
    });
    if (this.task) {
      this.taskForm.patchValue(this.task);
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskData: Task = { ...this.task, ...this.taskForm.value };
      this.save.emit(taskData);
    }
  }

  getFilteredStatuses(currentStatus: string): string[] {
    return this.statuses.filter((status) => status !== currentStatus && status !== TaskStatus.Completado);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
