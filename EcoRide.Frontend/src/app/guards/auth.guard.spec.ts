import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, roleGuard } from './auth.guard';

describe('Auth Guards', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole'], {
      isLoggedIn: false,
      currentUserValue: null
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/profile' } as RouterStateSnapshot;
  });

  describe('authGuard', () => {
    it('should allow access when user is logged in', () => {
      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not logged in', () => {
      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: false });

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
      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: false });
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
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['Passenger', 'Driver'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['Employee'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Employee', 'Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should redirect to home when user does not have required role', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['Passenger'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to login when user is not logged in', () => {
      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: false });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: null });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle empty user roles array', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: [],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Driver']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should work with multiple role requirements', () => {
      const mockUser = {
        userId: 1,
        username: 'AdminUser',
        email: 'admin@example.com',
        roles: ['Administrator', 'Employee'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Employee', 'Administrator']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should be case-sensitive with role names', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['driver'], // lowercase
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      Object.defineProperty(mockAuthService, 'isLoggedIn', { value: true });
      Object.defineProperty(mockAuthService, 'currentUserValue', { value: mockUser });

      const guard = roleGuard(['Driver']); // uppercase D
      const result = TestBed.runInInjectionContext(() =>
        guard(mockRoute, mockState)
      );

      // Should fail because of case mismatch
      expect(result).toBe(false);
    });
  });
});
