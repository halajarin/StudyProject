import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use signal-based isLoggedIn (computed signal)
  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const roleGuard = (roles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    // Use signal-based isLoggedIn
    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    // Use signal to get current user
    const user = authService.currentUser();
    if (user && user.roles && user.roles.some(role => roles.includes(role))) {
      return true;
    }

    // User doesn't have required role
    logger.warn('Access denied. Required roles:', roles, 'User roles:', user?.roles);
    router.navigate(['/'], {
      queryParams: { error: 'insufficient_permissions' }
    });
    return false;
  };
};
