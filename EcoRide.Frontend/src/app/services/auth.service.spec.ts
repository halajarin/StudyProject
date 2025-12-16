import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
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
    const newService = TestBed.inject(AuthService);
    expect(newService.currentUserValue).toBeNull();
    expect(newService.isLoggedIn).toBe(false);
  });

  it('should initialize with user from localStorage', () => {
    const mockUser = {
      utilisateurId: 1,
      pseudo: 'TestUser',
      email: 'test@example.com',
      roles: ['Passager'],
      credit: 100,
      noteMoyenne: 0,
      nombreAvis: 0
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    const newService = TestBed.inject(AuthService);
    expect(newService.currentUserValue).toEqual(mockUser);
    expect(newService.isLoggedIn).toBe(true);
  });

  describe('login', () => {
    it('should authenticate user and store token', (done) => {
      const credentials = { email: 'test@example.com', motDePasse: 'password123' };
      const mockResponse = {
        token: 'test-jwt-token',
        user: {
          utilisateurId: 1,
          pseudo: 'TestUser',
          email: 'test@example.com',
          roles: ['Passager'],
          credit: 100,
          noteMoyenne: 0,
          nombreAvis: 0
        }
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('test-jwt-token');
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockResponse.user));
        expect(service.currentUserValue).toEqual(mockResponse.user);
        expect(service.isLoggedIn).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const credentials = { email: 'test@example.com', motDePasse: 'wrong' };

      service.login(credentials).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
          expect(service.currentUserValue).toBeNull();
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
        pseudo: 'NewUser',
        email: 'new@example.com',
        motDePasse: 'password123'
      };

      const mockResponse = {
        token: 'new-jwt-token',
        user: {
          utilisateurId: 2,
          pseudo: 'NewUser',
          email: 'new@example.com',
          roles: ['Passager'],
          credit: 100,
          noteMoyenne: 0,
          nombreAvis: 0
        }
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('new-jwt-token');
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockResponse.user));
        expect(service.currentUserValue).toEqual(mockResponse.user);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });

    it('should handle registration error', (done) => {
      const userData = {
        pseudo: 'NewUser',
        email: 'existing@example.com',
        motDePasse: 'password123'
      };

      service.register(userData).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
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
      // Setup - login first
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: 1, email: 'test@example.com' }));

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(service.currentUserValue).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      const mockUser = {
        utilisateurId: 1,
        pseudo: 'TestUser',
        email: 'test@example.com',
        roles: ['Passager', 'Chauffeur'],
        credit: 100,
        noteMoyenne: 0,
        nombreAvis: 0
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const newService = TestBed.inject(AuthService);

      expect(newService.hasRole('Chauffeur')).toBe(true);
      expect(newService.hasRole('Passager')).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const mockUser = {
        utilisateurId: 1,
        pseudo: 'TestUser',
        email: 'test@example.com',
        roles: ['Passager'],
        credit: 100,
        noteMoyenne: 0,
        nombreAvis: 0
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const newService = TestBed.inject(AuthService);

      expect(newService.hasRole('Administrateur')).toBe(false);
    });

    it('should return false when user is not logged in', () => {
      expect(service.hasRole('Passager')).toBe(false);
    });
  });

  describe('token getter', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'my-test-token');
      expect(service.token).toBe('my-test-token');
    });

    it('should return null when no token in localStorage', () => {
      expect(service.token).toBeNull();
    });
  });

  describe('currentUser observable', () => {
    it('should emit current user', (done) => {
      const mockUser = {
        utilisateurId: 1,
        pseudo: 'TestUser',
        email: 'test@example.com',
        roles: ['Passager'],
        credit: 100,
        noteMoyenne: 0,
        nombreAvis: 0
      };

      service.currentUser.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      // Trigger login
      const credentials = { email: 'test@example.com', motDePasse: 'password123' };
      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ token: 'token', user: mockUser });
    });
  });
});
