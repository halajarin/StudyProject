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

  describe('searchCarpools', () => {
    it('should search carpools with filters', (done) => {
      const mockResponse = {
        data: [
          {
            carpoolId: 1,
            departureCity: 'Paris',
            arrivalCity: 'Lyon',
            departureDate: '2026-01-20',
            pricePerPerson: 25,
            availableSeats: 3,
            driver: {
              userId: 1,
              username: 'driver1',
              averageRating: 4.5
            }
          }
        ]
      };

      const searchParams = {
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        departureDate: '2026-01-20'
      };

      service.searchCarpools(searchParams).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
        expect(response.data[0].departureCity).toBe('Paris');
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiUrl}/carpool/search`)
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle search error', (done) => {
      const searchParams = {
        departureCity: '',
        arrivalCity: '',
        departureDate: ''
      };

      service.searchCarpools(searchParams).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiUrl}/carpool/search`)
      );
      req.flush({ message: 'Invalid search parameters' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getCarpoolById', () => {
    it('should get carpool details', (done) => {
      const carpoolId = 1;
      const mockCarpool = {
        carpoolId: 1,
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        departureDate: '2026-01-20',
        pricePerPerson: 25,
        availableSeats: 3,
        totalSeats: 4,
        driver: {
          userId: 1,
          username: 'driver1',
          averageRating: 4.5,
          reviewCount: 10
        },
        vehicle: {
          vehicleId: 1,
          model: 'Tesla Model 3',
          energyType: 'Electric'
        }
      };

      service.getCarpoolById(carpoolId).subscribe(carpool => {
        expect(carpool).toEqual(mockCarpool);
        expect(carpool.carpoolId).toBe(1);
        expect(carpool.driver.averageRating).toBe(4.5);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCarpool);
    });

    it('should handle carpool not found', (done) => {
      const carpoolId = 999;

      service.getCarpoolById(carpoolId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}`);
      req.flush({ message: 'Carpool not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCarpool', () => {
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

      const mockResponse = {
        carpoolId: 1,
        ...newCarpool,
        availableSeats: 4,
        status: 'Pending'
      };

      service.createCarpool(newCarpool).subscribe(response => {
        expect(response.carpoolId).toBe(1);
        expect(response.status).toBe('Pending');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCarpool);
      req.flush(mockResponse);
    });
  });

  describe('participateInCarpool', () => {
    it('should participate in carpool successfully', (done) => {
      const carpoolId = 1;
      const mockResponse = {
        success: true,
        message: 'Participation confirmed',
        remainingCredits: 75
      };

      service.participateInCarpool(carpoolId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.remainingCredits).toBe(75);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/participate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle insufficient credits', (done) => {
      const carpoolId = 1;

      service.participateInCarpool(carpoolId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/participate`);
      req.flush({ message: 'Insufficient credits' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('cancelParticipation', () => {
    it('should cancel participation successfully', (done) => {
      const carpoolId = 1;
      const mockResponse = {
        success: true,
        message: 'Participation cancelled and credits refunded'
      };

      service.cancelParticipation(carpoolId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toContain('refunded');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/${carpoolId}/cancel-participation`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getMyTripsAsDriver', () => {
    it('should get user trips as driver', (done) => {
      const mockTrips = [
        {
          carpoolId: 1,
          departureCity: 'Paris',
          arrivalCity: 'Lyon',
          status: 'Pending',
          availableSeats: 2
        },
        {
          carpoolId: 2,
          departureCity: 'Lyon',
          arrivalCity: 'Marseille',
          status: 'Completed',
          availableSeats: 0
        }
      ];

      service.getMyTripsAsDriver().subscribe(trips => {
        expect(trips.length).toBe(2);
        expect(trips[0].status).toBe('Pending');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/my-trips/driver`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrips);
    });
  });

  describe('getMyTripsAsPassenger', () => {
    it('should get user trips as passenger', (done) => {
      const mockTrips = [
        {
          carpoolId: 3,
          departureCity: 'Paris',
          arrivalCity: 'Nice',
          status: 'In Progress',
          driver: {
            userId: 2,
            username: 'driver2',
            averageRating: 4.8
          }
        }
      ];

      service.getMyTripsAsPassenger().subscribe(trips => {
        expect(trips.length).toBe(1);
        expect(trips[0].driver.averageRating).toBe(4.8);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/carpool/my-trips/passenger`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrips);
    });
  });
});
