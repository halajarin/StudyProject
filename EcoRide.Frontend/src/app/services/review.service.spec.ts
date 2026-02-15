import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService } from './review.service';
import { environment } from '../../environments/environment';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewService]
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a review', (done) => {
      const newReview = {
        targetUserId: 2,
        carpoolId: 1,
        note: 5,
        comment: 'Great driver!'
      };

      const mockResponse = { reviewId: 1, status: 'Pending' };

      service.create(newReview).subscribe(response => {
        expect(response.reviewId).toBe(1);
        expect(response.status).toBe('Pending');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReview);
      req.flush(mockResponse);
    });

    it('should handle create error', (done) => {
      const newReview = { targetUserId: 2, carpoolId: 1, note: 5, comment: 'Great!' };

      service.create(newReview).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review`);
      req.flush({ message: 'Already reviewed' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getByUser', () => {
    it('should get reviews for a user', (done) => {
      const userId = 1;
      const mockReviews = [
        { reviewId: 1, note: 5, comment: 'Excellent!', status: 'Validated' },
        { reviewId: 2, note: 4, comment: 'Good trip', status: 'Validated' }
      ];

      service.getByUser(userId).subscribe(reviews => {
        expect(reviews.length).toBe(2);
        expect(reviews[0].note).toBe(5);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReviews);
    });

    it('should return empty array when no reviews', (done) => {
      const userId = 999;

      service.getByUser(userId).subscribe(reviews => {
        expect(reviews.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/user/${userId}`);
      req.flush([]);
    });
  });
});
