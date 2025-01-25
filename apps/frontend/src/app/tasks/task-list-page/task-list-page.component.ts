import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Router } from '@angular/router';
import { Task } from '../../interfaces/task.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss'],
})
export class TaskListPageComponent implements OnInit {
  tasks: Observable<Task[]>;
  displayedColumns: string[] = ['title', 'description', 'createdAt', 'status'];

  constructor(private authService: AuthService, private router: Router, private taskService: TaskService) {
    this.tasks = this.taskService.tasks$;
  }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe({
      error: (err) => console.error('Error al cargar tareas:', err),
    });
  }

  toggleTaskStatus(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(updatedTask).subscribe({
      next: () => console.log('Estado de tarea actualizado'),
      error: (err) => console.error('Error al actualizar tarea:', err),
    });
  }

  addTask(): void {
    console.log('Abrir formulario para agregar tarea');
  }

  deleteTask(task: Task): void {
    if (!task.id) {
      return;
    }
    this.taskService.deleteTask(task.id).subscribe({
      next: () => console.log('Tarea eliminada'),
      error: (err) => console.error('Error al eliminar tarea:', err),
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Error durante el cierre de sesión:', err);
      },
    });
  }

}
