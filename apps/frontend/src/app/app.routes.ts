import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/login-page/login-page.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginPageComponent, canActivate: [guestGuard] },
  { path: 'tasks', loadComponent: () => import('./tasks/task-list-page/task-list-page.component').then((m) => m.TaskListPageComponent), canActivate: [authGuard] },
];
