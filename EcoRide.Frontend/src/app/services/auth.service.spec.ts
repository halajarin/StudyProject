import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let storageService: StorageService;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        StorageService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null user when no user in localStorage', () => {
    expect(service.currentUserValue).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  describe('login', () => {
    it('should authenticate user and store token', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        message: 'Login successful',
        token: 'test-jwt-token',
        user: {
          userId: 1,
          username: 'TestUser',
          email: 'test@example.com',
          roles: ['Passenger'],
          credits: 100,
          averageRating: 0,
          reviewCount: 0
        }
      };

      service.login(credentials).subscribe(response => {
        expect(response.token).toBe('test-jwt-token');
        expect(localStorage.getItem('token')).toBe('test-jwt-token');
        expect(service.isLoggedIn()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const credentials = { email: 'test@example.com', password: 'wrong' };

      service.login(credentials).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error: any) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register user and store token', (done) => {
      const userData = {
        username: 'NewUser',
        email: 'new@example.com',
        password: 'password123'
      };

      const mockResponse = {
        message: 'Registration successful',
        token: 'new-jwt-token',
        user: {
          userId: 2,
          username: 'NewUser',
          email: 'new@example.com',
          roles: ['Passenger'],
          credits: 20,
          averageRating: 0,
          reviewCount: 0
        }
      };

      service.register(userData).subscribe(response => {
        expect(response.token).toBe('new-jwt-token');
        expect(localStorage.getItem('token')).toBe('new-jwt-token');
        expect(service.isLoggedIn()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });

    it('should handle registration error', (done) => {
      const userData = {
        username: 'NewUser',
        email: 'existing@example.com',
        password: 'password123'
      };

      service.register(userData).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('logout', () => {
    it('should clear user data and navigate to login', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ userId: 1, email: 'test@example.com' }));
      storageService.refreshSignals();

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['Passenger', 'Driver'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      storageService.setCurrentUser(mockUser as any);

      expect(service.hasRole('Driver')).toBe(true);
      expect(service.hasRole('Passenger')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const mockUser = {
        userId: 1,
        username: 'TestUser',
        email: 'test@example.com',
        roles: ['Passenger'],
        credits: 100,
        averageRating: 0,
        reviewCount: 0
      };

      storageService.setCurrentUser(mockUser as any);

      expect(service.hasRole('Administrator')).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      expect(service.hasRole('Passenger')).toBe(false);
    });
  });

  describe('isLoggedIn signal', () => {
    it('should be true after login', (done) => {
      const mockResponse = {
        message: 'OK',
        token: 'token',
        user: {
          userId: 1,
          username: 'TestUser',
          email: 'test@example.com',
          roles: ['Passenger'],
          credits: 100,
          averageRating: 0,
          reviewCount: 0
        }
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('should be false after logout', () => {
      storageService.setToken('token');
      storageService.setCurrentUser({ userId: 1, username: 'u', email: 'e', roles: [], credits: 0, averageRating: 0, reviewCount: 0 } as any);

      service.logout();

      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
