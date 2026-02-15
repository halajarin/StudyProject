import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { authGuard, roleGuard } from './auth.guard';

describe('Auth Guards', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  // Writable signals to control test state
  const isLoggedInSignal = signal(false);
  const currentUserSignal = signal<any>(null);

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockAuthService = {
      isLoggedIn: isLoggedInSignal,
      currentUser: currentUserSignal,
      hasRole: (role: string) => {
        const user = currentUserSignal();
        return user?.roles?.includes(role) ?? false;
      }
    };

    const mockLogger = {
      warn: jasmine.createSpy('warn')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoggerService, useValue: mockLogger }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/profile' } as RouterStateSnapshot;

    // Reset state
    isLoggedInSignal.set(false);
    currentUserSignal.set(null);
  });

  describe('authGuard', () => {
    it('should allow access when user is logged in', () => {
      isLoggedInSignal.set(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not logged in', () => {
      isLoggedInSignal.set(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/profile' } }
      );
    });

    it('should include returnUrl in query params', () => {
      isLoggedInSignal.set(false);
      mockState = { url: '/admin/dashboard' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin/dashboard' } }
      );
    });
  });

  describe('roleGuard', () => {
    it('should allow access when user has required role', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'TestUser', email: 'test@example.com',
        roles: ['Passenger', 'Driver'], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple required roles', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'TestUser', email: 'test@example.com',
        roles: ['Employee'], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Employee', 'Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should redirect to home when user does not have required role', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'TestUser', email: 'test@example.com',
        roles: ['Passenger'], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/'],
        { queryParams: { error: 'insufficient_permissions' } }
      );
    });

    it('should redirect to login when user is not logged in', () => {
      isLoggedInSignal.set(false);
      currentUserSignal.set(null);

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle empty user roles array', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'TestUser', email: 'test@example.com',
        roles: [], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
    });

    it('should work with multiple role requirements', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'AdminUser', email: 'admin@example.com',
        roles: ['Administrator', 'Employee'], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Employee', 'Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should be case-sensitive with role names', () => {
      isLoggedInSignal.set(true);
      currentUserSignal.set({
        userId: 1, username: 'TestUser', email: 'test@example.com',
        roles: ['driver'], credits: 100, averageRating: 0, reviewCount: 0
      });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
    });
  });
});
