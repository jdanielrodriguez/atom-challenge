import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Task } from '../../interfaces/task.interface';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private lastModifiedTaskSubject = new BehaviorSubject<Task | null>(null);

  public tasks$ = this.tasksSubject.asObservable();
  public lastModifiedTask$ = this.lastModifiedTaskSubject.asObservable();

  private apiUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  private transformTaskDates(task: Task): Task {
    if (task.createdAt && typeof task.createdAt === 'object' && '_seconds' in task.createdAt) {
      task.createdAt = new Date(task.createdAt._seconds * 1000);
    }
    return task;
  }

  private transformTasksDates(tasks: Task[]): Task[] {
    return tasks.map(task => {
      if (task.createdAt && typeof task.createdAt === 'object' && '_seconds' in task.createdAt) {
        return {
          ...task,
          createdAt: new Date(task.createdAt._seconds * 1000),
        };
      }
      return task;
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => this.transformTasksDates(tasks)),
      tap(transformedTasks => this.tasksSubject.next(transformedTasks)),
      catchError(this.handleError)
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, this.formatTaskBeforeSending(task)).pipe(
      map(this.transformTaskDates),
      tap((newTask) => {
        const currentTasks = this.tasksSubject.getValue();
        this.tasksSubject.next([...currentTasks, newTask]);
        this.lastModifiedTaskSubject.next(newTask);
      }),
      catchError(this.handleError)
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, this.formatTaskBeforeSending(task)).pipe(
      map(this.transformTaskDates),
      tap((updatedTask) => {
        const currentTasks = this.tasksSubject.getValue();
        const taskIndex = currentTasks.findIndex((t) => t.id === updatedTask.id);
        if (taskIndex > -1) {
          currentTasks[taskIndex] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
        this.lastModifiedTaskSubject.next(updatedTask);
      }),
      catchError(this.handleError)
    );
  }

  private formatTaskBeforeSending(task: Task): any {
    const formattedTask = { ...task };
    if (task.createdAt instanceof Date) {
      formattedTask.createdAt = {
        _seconds: Math.floor(task.createdAt.getTime() / 1000),
        _nanoseconds: (task.createdAt.getTime() % 1000) * 1e6,
      };
    }
    return formattedTask;
  }

  deleteTask(taskId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.getValue().filter((task) => task.id !== taskId);
        this.tasksSubject.next(currentTasks);
        this.lastModifiedTaskSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }
}
