import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de rôle - vérifie que l'utilisateur a le rôle requis
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] || [];

  if (!authService.isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requiredRoles.length === 0 || authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
