import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('token management', () => {
    it('should return null when no token stored', () => {
      expect(service.token()).toBeNull();
      expect(service.getToken()).toBeNull();
    });

    it('should store and retrieve token', () => {
      service.setToken('my-jwt-token');

      expect(service.token()).toBe('my-jwt-token');
      expect(service.getToken()).toBe('my-jwt-token');
      expect(localStorage.getItem('token')).toBe('my-jwt-token');
    });

    it('should remove token', () => {
      service.setToken('my-jwt-token');
      service.removeToken();

      expect(service.token()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('currentUser management', () => {
    const mockUser = {
      userId: 1,
      username: 'TestUser',
      email: 'test@example.com',
      roles: ['Passenger'],
      credits: 100,
      averageRating: 4.5,
      reviewCount: 10
    };

    it('should return null when no user stored', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should store and retrieve user', () => {
      service.setCurrentUser(mockUser as any);

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
      expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
    });

    it('should remove user', () => {
      service.setCurrentUser(mockUser as any);
      service.removeCurrentUser();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should handle corrupted JSON in localStorage gracefully', () => {
      localStorage.setItem('currentUser', 'not-valid-json');

      const freshService = TestBed.inject(StorageService);
      freshService.refreshSignals();

      expect(freshService.getCurrentUser()).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should clear both token and user', () => {
      service.setToken('token');
      service.setCurrentUser({ userId: 1, username: 'u', email: 'e', roles: [], credits: 0, averageRating: 0, reviewCount: 0 } as any);

      service.clearAuth();

      expect(service.token()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('refreshSignals', () => {
    it('should sync signals with localStorage', () => {
      // Manually set localStorage (bypassing signals)
      localStorage.setItem('token', 'external-token');
      localStorage.setItem('currentUser', JSON.stringify({ userId: 99, username: 'ext', email: 'ext@test.com', roles: [], credits: 0, averageRating: 0, reviewCount: 0 }));

      service.refreshSignals();

      expect(service.token()).toBe('external-token');
      expect(service.currentUser()!.userId).toBe(99);
    });
  });

  describe('signal reactivity', () => {
    it('should update token signal immediately on setToken', () => {
      expect(service.token()).toBeNull();
      service.setToken('new-token');
      expect(service.token()).toBe('new-token');
    });

    it('should update user signal immediately on setCurrentUser', () => {
      expect(service.currentUser()).toBeNull();
      service.setCurrentUser({ userId: 1, username: 'u', email: 'e', roles: ['Driver'], credits: 50, averageRating: 0, reviewCount: 0 } as any);
      expect(service.currentUser()!.roles).toContain('Driver');
    });
  });
});
