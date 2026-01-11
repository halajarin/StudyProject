import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Review } from '../../../interfaces/review.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'navigation.employee_dashboard' | translate }}</h1>

      <div class="card">
        <h2>{{ 'admin.pending_reviews' | translate }}</h2>
        @if (pendingReviews.length > 0) {
          @for (review of pendingReviews; track review.reviewId) {
            <div class="review-card">
              <div class="review-header">
                <h4>{{ review.authorUsername }} → {{ review.targetUsername }}</h4>
                <span class="rating">{{ 'carpool.rating' | translate }}: {{ review.note }}/5</span>
              </div>
              <p>{{ review.comment }}</p>
              <div class="review-actions">
                <button (click)="validateReview(review.reviewId)" class="btn btn-primary">
                  {{ 'admin.validate_review' | translate }}
                </button>
                <button (click)="rejectReview(review.reviewId)" class="btn btn-danger">
                  {{ 'admin.reject_review' | translate }}
                </button>
              </div>
            </div>
          }
        } @else {
          <p>{{ 'review.no_reviews' | translate }}</p>
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
  pendingReviews: Review[] = [];

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadPendingReviews();
  }

  loadPendingReviews() {
    this.http.get<any[]>(`${environment.apiUrl}/review/pending`).subscribe({
      next: (data) => this.pendingReviews = data,
    });
  }

  validateReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/validate`, {}).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.loadPendingReviews();
      },
    });
  }

  rejectReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/reject`, {}).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.loadPendingReviews();
      },
    });
  }
}
