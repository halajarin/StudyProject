import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should fetch user profile via GET', (done) => {
      const mockProfile = { userId: 1, username: 'testuser', email: 'test@test.com' };

      service.getProfile().subscribe(profile => {
        expect(profile.username).toBe('testuser');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile via PUT', (done) => {
      const updateData = { username: 'newname' };
      const mockResponse = { userId: 1, username: 'newname' };

      service.updateProfile(updateData).subscribe(response => {
        expect(response.username).toBe('newname');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/profile`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('addRole', () => {
    it('should add a role via POST', (done) => {
      service.addRole(2).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/add-role/2`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('vehicles', () => {
    it('should get vehicles via GET', (done) => {
      const mockVehicles = [{ vehicleId: 1, brandId: 1, model: 'Model 3' }];

      service.getVehicles().subscribe(vehicles => {
        expect(vehicles.length).toBe(1);
        expect(vehicles[0].model).toBe('Model 3');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/vehicles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVehicles);
    });

    it('should add a vehicle via POST', (done) => {
      const newVehicle = { brandId: 1, model: 'Model 3', color: 'White', energyType: 'Electric', seatCount: 5, registrationNumber: 'AB-123-CD', firstRegistrationDate: '2024-01-01' };
      const mockResponse = { vehicleId: 1, ...newVehicle };

      service.addVehicle(newVehicle as any).subscribe(response => {
        expect(response.vehicleId).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/vehicles`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should update a vehicle via PUT', (done) => {
      const vehicleData = { brandId: 1, model: 'Model Y', color: 'Black', energyType: 'Electric', seatCount: 5, registrationNumber: 'AB-123-CD', firstRegistrationDate: '2024-01-01' };

      service.updateVehicle(1, vehicleData as any).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/vehicles/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should delete a vehicle via DELETE', (done) => {
      service.deleteVehicle(1).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/vehicles/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('credits', () => {
    it('should add credits via POST', (done) => {
      service.addCredits(50).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/add-credits`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount: 50 });
      req.flush({});
    });
  });

  describe('preferences', () => {
    it('should get preferences via GET', (done) => {
      const mockPrefs = { smokingAllowed: false, petsAllowed: true, musicAllowed: true, conversationLevel: 'moderate' };

      service.getPreferences().subscribe(prefs => {
        expect(prefs.petsAllowed).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/preferences`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPrefs);
    });

    it('should save preferences via POST', (done) => {
      const prefs = { smokingAllowed: false, petsAllowed: true, musicAllowed: true, conversationLevel: 'moderate' } as any;

      service.savePreferences(prefs).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/preferences`);
      expect(req.request.method).toBe('POST');
      req.flush(prefs);
    });
  });

  describe('changePassword', () => {
    it('should change password via POST to auth endpoint', (done) => {
      service.changePassword('oldPass', 'newPass').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword: 'oldPass', newPassword: 'newPass' });
      req.flush({});
    });

    it('should handle wrong current password error', (done) => {
      service.changePassword('wrongPass', 'newPass').subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
      req.flush({ message: 'Current password is incorrect' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('account management', () => {
    it('should deactivate account via POST', (done) => {
      service.deactivateAccount().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/deactivate`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should delete account via DELETE', (done) => {
      service.deleteAccount('password123').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/user/account`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
