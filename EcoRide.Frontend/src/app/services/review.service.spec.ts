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

  describe('getUserReviews', () => {
    it('should get validated reviews for a user', (done) => {
      const userId = 1;
      const mockReviews = [
        {
          reviewId: 1,
          note: 5,
          comment: 'Excellent driver!',
          status: 'Validated',
          authorUsername: 'passenger1',
          createdAt: '2026-01-15T10:00:00Z'
        },
        {
          reviewId: 2,
          note: 4,
          comment: 'Very good',
          status: 'Validated',
          authorUsername: 'passenger2',
          createdAt: '2026-01-16T14:30:00Z'
        }
      ];

      service.getUserReviews(userId).subscribe(reviews => {
        expect(reviews.length).toBe(2);
        expect(reviews[0].note).toBe(5);
        expect(reviews[0].status).toBe('Validated');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReviews);
    });

    it('should return empty array when user has no reviews', (done) => {
      const userId = 999;

      service.getUserReviews(userId).subscribe(reviews => {
        expect(reviews).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/user/${userId}`);
      req.flush([]);
    });
  });

  describe('createReview', () => {
    it('should create a new review successfully', (done) => {
      const newReview = {
        targetUserId: 2,
        carpoolId: 1,
        note: 5,
        comment: 'Great driver!'
      };

      const mockResponse = {
        reviewId: 1,
        ...newReview,
        status: 'Pending',
        createdAt: '2026-01-18T12:00:00Z'
      };

      service.createReview(newReview).subscribe(response => {
        expect(response.reviewId).toBe(1);
        expect(response.status).toBe('Pending');
        expect(response.note).toBe(5);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newReview);
      req.flush(mockResponse);
    });

    it('should handle duplicate review error', (done) => {
      const newReview = {
        targetUserId: 2,
        carpoolId: 1,
        note: 5,
        comment: 'Great driver!'
      };

      service.createReview(newReview).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('You have already reviewed this trip');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review`);
      req.flush(
        { message: 'You have already reviewed this trip' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle trip not validated error', (done) => {
      const newReview = {
        targetUserId: 2,
        carpoolId: 1,
        note: 5,
        comment: 'Great!'
      };

      service.createReview(newReview).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toContain('validate the trip');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review`);
      req.flush(
        { message: 'You must first validate the trip' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('getPendingReviews', () => {
    it('should get pending reviews for employees', (done) => {
      const mockPendingReviews = [
        {
          reviewId: 3,
          note: 3,
          comment: 'Average',
          status: 'Pending',
          authorUsername: 'user1',
          targetUsername: 'user2',
          createdAt: '2026-01-17T09:00:00Z'
        },
        {
          reviewId: 4,
          note: 5,
          comment: 'Excellent!',
          status: 'Pending',
          authorUsername: 'user3',
          targetUsername: 'user4',
          createdAt: '2026-01-18T10:00:00Z'
        }
      ];

      service.getPendingReviews().subscribe(reviews => {
        expect(reviews.length).toBe(2);
        expect(reviews[0].status).toBe('Pending');
        expect(reviews[1].status).toBe('Pending');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPendingReviews);
    });
  });

  describe('validateReview', () => {
    it('should validate a pending review', (done) => {
      const reviewId = 3;
      const mockResponse = {
        message: 'Review validated'
      };

      service.validateReview(reviewId).subscribe(response => {
        expect(response.message).toBe('Review validated');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/${reviewId}/validate`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should handle review not found', (done) => {
      const reviewId = 999;

      service.validateReview(reviewId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/${reviewId}/validate`);
      req.flush({ message: 'Review not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('rejectReview', () => {
    it('should reject a pending review', (done) => {
      const reviewId = 3;
      const mockResponse = {
        message: 'Review rejected'
      };

      service.rejectReview(reviewId).subscribe(response => {
        expect(response.message).toBe('Review rejected');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/review/${reviewId}/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });
});
