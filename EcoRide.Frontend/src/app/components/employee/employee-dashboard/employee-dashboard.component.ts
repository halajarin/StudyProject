import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Employee Dashboard</h1>

      <div class="card">
        <h2>Reviews pending validation</h2>
        @if (pendingReviews.length > 0) {
          @for (review of pendingReviews; track review.reviewId) {
            <div class="review-card">
              <div class="review-header">
                <h4>{{ review.authorUsername }} → {{ review.targetUsername }}</h4>
                <span class="rating">Rating: {{ review.rating }}/5</span>
              </div>
              <p>{{ review.comment }}</p>
              <div class="review-actions">
                <button (click)="validateReview(review.reviewId)" class="btn btn-primary">
                  Validate
                </button>
                <button (click)="rejectReview(review.reviewId)" class="btn btn-danger">
                  Reject
                </button>
              </div>
            </div>
          }
        } @else {
          <p>No pending reviews</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .review-card {
      background-color: var(--very-light-green);
      padding: 1.5rem;
      margin: 1rem 0;
      border-radius: 10px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .rating {
      color: var(--warning);
      font-weight: bold;
    }

    .review-actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  pendingReviews: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingReviews();
  }

  loadPendingReviews() {
    this.http.get<any[]>(`${environment.apiUrl}/review/pending`).subscribe({
      next: (data) => this.pendingReviews = data,
      error: (err) => console.error(err)
    });
  }

  validateReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/validate`, {}).subscribe({
      next: () => {
        alert('Review validated');
        this.loadPendingReviews();
      },
      error: (err) => console.error(err)
    });
  }

  rejectReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/reject`, {}).subscribe({
      next: () => {
        alert('Review rejected');
        this.loadPendingReviews();
      },
      error: (err) => console.error(err)
    });
  }
}
