import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => this.tasksSubject.next(tasks)),
      catchError(this.handleError)
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap((newTask) => {
        const currentTasks = this.tasksSubject.getValue();
        this.tasksSubject.next([...currentTasks, newTask]);
        this.lastModifiedTaskSubject.next(newTask);
      }),
      catchError(this.handleError)
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
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
