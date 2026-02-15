import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarpoolService } from './carpool.service';
import { environment } from '../../environments/environment';

describe('CarpoolService', () => {
  let service: CarpoolService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarpoolService]
    });

    service = TestBed.inject(CarpoolService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should search carpools via POST', (done) => {
      const mockResults = [
        {
          carpoolId: 1,
          departureCity: 'Paris',
          arrivalCity: 'Lyon',
          departureDate: '2026-01-20',
          pricePerPerson: 25,
          availableSeats: 3
        }
      ];

      const searchParams = {
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        departureDate: '2026-01-20'
      };

      service.search(searchParams).subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].departureCity).toBe('Paris');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResults);
    });

    it('should handle search error', (done) => {
      const searchParams = {
        departureCity: '',
        arrivalCity: '',
        departureDate: ''
      };

      service.search(searchParams).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/search`);
      req.flush({ message: 'Invalid search parameters' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getById', () => {
    it('should get carpool details', (done) => {
      const carpoolId = 1;
      const mockCarpool = {
        carpoolId: 1,
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        pricePerPerson: 25,
        availableSeats: 3
      };

      service.getById(carpoolId).subscribe(carpool => {
        expect(carpool.carpoolId).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCarpool);
    });

    it('should handle carpool not found', (done) => {
      const carpoolId = 999;

      service.getById(carpoolId).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}`);
      req.flush({ message: 'Carpool not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new carpool', (done) => {
      const newCarpool = {
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        departureDate: '2026-01-20',
        departureTime: '08:00',
        pricePerPerson: 25,
        totalSeats: 4,
        vehicleId: 1
      };

      const mockResponse = { carpoolId: 1, status: 'Pending' };

      service.create(newCarpool as any).subscribe(response => {
        expect(response.carpoolId).toBe(1);
        expect(response.status).toBe('Pending');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('participate', () => {
    it('should participate in carpool successfully', (done) => {
      const carpoolId = 1;
      const mockResponse = { success: true, message: 'Participation confirmed' };

      service.participate(carpoolId).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/participate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle insufficient credits', (done) => {
      const carpoolId = 1;

      service.participate(carpoolId).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/participate`);
      req.flush({ message: 'Insufficient credits' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('cancel', () => {
    it('should cancel participation successfully', (done) => {
      const carpoolId = 1;
      const mockResponse = { success: true, message: 'Cancelled' };

      service.cancel(carpoolId).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/cancel`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getMyTrips', () => {
    it('should get user trips', (done) => {
      const mockTrips = {
        asDriver: [{ carpoolId: 1, status: 'Pending' }],
        asPassenger: [{ carpoolId: 2, status: 'Completed' }]
      };

      service.getMyTrips().subscribe(trips => {
        expect(trips.asDriver.length).toBe(1);
        expect(trips.asPassenger.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/my-trips`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrips);
    });
  });

  describe('validateTrip', () => {
    it('should validate a trip', (done) => {
      const carpoolId = 1;
      const mockResponse = { success: true };

      service.validateTrip(carpoolId, true).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/participation/${carpoolId}/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ tripOk: true, comment: undefined });
      req.flush(mockResponse);
    });

    it('should validate a trip with problem comment', (done) => {
      const carpoolId = 1;
      const mockResponse = { success: true };

      service.validateTrip(carpoolId, false, 'Driver was late').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/participation/${carpoolId}/validate`);
      expect(req.request.body).toEqual({ tripOk: false, comment: 'Driver was late' });
      req.flush(mockResponse);
    });
  });
});
