import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { take, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/tasks']);
        return false;
      }
      return true;
    })
  );
};
