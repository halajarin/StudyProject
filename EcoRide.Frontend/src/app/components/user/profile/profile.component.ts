import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { User } from '../../../models/user.model';
import { UserRole, RoleId } from '../../../models/role.enum';
import { Vehicle } from '../../../models/vehicle.model';
import { Carpool, CarpoolStatus } from '../../../models/carpool.model';
import { Review, CreateReview } from '../../../models/review.model';
import { CreateVehicleForm } from '../../../interfaces/vehicle.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'user.profile' | translate }}</h1>

      @if (user()) {
        <div class="grid grid-2">
          <div class="card">
            <h2>{{ 'user.profile' | translate }}</h2>
            <div class="profile-info">
              <p><strong>{{ 'auth.username' | translate }}:</strong> {{ user()?.username }}</p>
              <p><strong>{{ 'auth.email' | translate }}:</strong> {{ user()?.email }}</p>
              <p><strong>{{ 'user.credits' | translate }}:</strong> <span class="credit-amount">{{ user()?.credits }}</span></p>
              <p><strong>{{ 'carpool.rating' | translate }}:</strong> ⭐ {{ user()?.averageRating?.toFixed(1) }} ({{ user()?.reviewCount }} {{ 'review.reviews' | translate }})</p>
              <p><strong>{{ 'user.roles' | translate }}:</strong> {{ user()?.roles?.join(', ') }}</p>
            </div>

            <div class="role-section">
              <h3>{{ 'auth.become_driver' | translate }}</h3>
              @if (!hasRole(UserRole.Driver)) {
                <button (click)="becomeDriver()" class="btn btn-primary">
                  {{ 'user.become_driver_action' | translate }}
                </button>
              } @else {
                <p class="badge badge-success">{{ 'user.is_driver' | translate }}</p>
              }
            </div>
          </div>

          <div class="card">
            <h2>{{ 'user.my_vehicles' | translate }}</h2>
            @if (vehicles().length > 0) {
              @for (vehicle of vehicles(); track vehicle.vehicleId) {
                <div class="vehicle-card">
                  <h4>{{ vehicle.brandLabel }} {{ vehicle.model }}</h4>
                  <p>{{ vehicle.registrationNumber }} - {{ vehicle.energyType }}</p>
                  <p>{{ vehicle.seatCount }} {{ 'carpool.seats_available' | translate }} - {{ vehicle.color }}</p>
                </div>
              }
            } @else {
              <p>{{ 'user.no_vehicles' | translate }}</p>
            }

            @if (hasRole(UserRole.Driver)) {
              <button (click)="showAddVehicle.set(!showAddVehicle())" class="btn btn-secondary mt-2">
                {{ showAddVehicle() ? ('common.cancel' | translate) : ('user.add_vehicle' | translate) }}
              </button>

              @if (showAddVehicle()) {
                <form (ngSubmit)="addVehicle()" class="mt-2">
                  <div class="form-group">
                    <label>{{ 'vehicle.brand' | translate }}</label>
                    <select [(ngModel)]="newVehicle.brandId" name="brandId" required>
                      <option value="">{{ 'carpool.select_vehicle' | translate }}</option>
                      <option value="1">Renault</option>
                      <option value="2">Peugeot</option>
                      <option value="3">Citroën</option>
                      <option value="4">Tesla</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>{{ 'vehicle.model' | translate }}</label>
                    <input type="text" [(ngModel)]="newVehicle.model" name="model" required>
                  </div>
                  <div class="form-group">
                    <label>{{ 'vehicle.registration_number' | translate }}</label>
                    <input type="text" [(ngModel)]="newVehicle.registrationNumber" name="registrationNumber" required>
                  </div>
                  <div class="form-group">
                    <label>{{ 'vehicle.energy_type' | translate }}</label>
                    <select [(ngModel)]="newVehicle.energyType" name="energyType" required>
                      <option value="Gasoline">{{ 'vehicle.types.gasoline' | translate }}</option>
                      <option value="Diesel">{{ 'vehicle.types.diesel' | translate }}</option>
                      <option value="Electric">{{ 'vehicle.types.electric' | translate }}</option>
                      <option value="Hybrid">{{ 'vehicle.types.hybrid' | translate }}</option>
                      <option value="LPG">{{ 'vehicle.types.lpg' | translate }}</option>
                      <option value="CNG">{{ 'vehicle.types.cng' | translate }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>{{ 'vehicle.color' | translate }}</label>
                    <input type="text" [(ngModel)]="newVehicle.color" name="color" required>
                  </div>
                  <div class="form-group">
                    <label>{{ 'vehicle.seat_count' | translate }}</label>
                    <input type="number" [(ngModel)]="newVehicle.seatCount" name="seatCount" min="1" max="8" required>
                  </div>
                  <button type="submit" class="btn btn-primary">{{ 'common.save' | translate }}</button>
                </form>
              }
            }
          </div>
        </div>

        @if (hasRole(UserRole.Driver)) {
          <div class="card mt-3">
            <h2>{{ 'carpool.driver' | translate }}</h2>
            <a routerLink="/create-carpool" class="btn btn-primary">
              ➕ {{ 'navigation.create_carpool' | translate }}
            </a>
          </div>
        }

        <div class="card mt-3">
          <h2>{{ 'navigation.my_trips' | translate }}</h2>
          @if (loading()) {
            <p>{{ 'common.loading' | translate }}</p>
          } @else {
            <div class="trips-section">
              <h3>{{ 'carpool.driver' | translate }}</h3>
              @if (myTrips().asDriver && myTrips().asDriver.length > 0) {
                @for (trip of myTrips().asDriver; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>

                    <div class="trip-actions">
                      @if (trip.status === CarpoolStatus.Pending) {
                        <button (click)="startTrip(trip.carpoolId)"
                                class="btn btn-primary btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ actioningTripId() === trip.carpoolId ? ('common.loading' | translate) : ('carpool.start' | translate) }}
                        </button>
                        <button (click)="cancelTrip(trip.carpoolId)"
                                class="btn btn-danger btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ 'carpool.cancel_trip' | translate }}
                        </button>
                      }

                      @if (trip.status === CarpoolStatus.InProgress) {
                        <button (click)="completeTrip(trip.carpoolId)"
                                class="btn btn-success btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ actioningTripId() === trip.carpoolId ? ('common.loading' | translate) : ('carpool.complete' | translate) }}
                        </button>
                        <button (click)="cancelTrip(trip.carpoolId)"
                                class="btn btn-danger btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ 'carpool.cancel_trip' | translate }}
                        </button>
                      }

                      @if (trip.status === CarpoolStatus.Completed) {
                        <span class="badge badge-success">✅ {{ 'carpool.status.completed' | translate }}</span>
                      }

                      @if (trip.status === CarpoolStatus.Cancelled) {
                        <span class="badge badge-danger">❌ {{ 'carpool.status.cancelled' | translate }}</span>
                      }
                    </div>
                  </div>
                }
              } @else {
                <p>{{ 'carpool.no_trips_driver' | translate }}</p>
              }

              <h3 class="mt-2">{{ 'carpool.passengers' | translate }}</h3>
              @if (myTrips().asPassenger && myTrips().asPassenger.length > 0) {
                @for (trip of myTrips().asPassenger; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>

                    <!-- Validation buttons (for completed, non-validated trips) -->
                    @if (trip.status === CarpoolStatus.Completed && !hasValidated(trip.carpoolId)) {
                      <div class="trip-actions mt-2">
                        <button (click)="validateTripOk(trip.carpoolId)"
                                class="btn btn-success btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ actioningTripId() === trip.carpoolId ? ('common.loading' | translate) : ('carpool.validate_trip' | translate) }}
                        </button>
                        <button (click)="openProblemForm(trip.carpoolId)"
                                class="btn btn-warning btn-sm"
                                [disabled]="actioningTripId() === trip.carpoolId">
                          {{ 'carpool.report_problem' | translate }}
                        </button>
                      </div>
                    }

                    <!-- Problem form -->
                    @if (showProblemForm() === trip.carpoolId) {
                      <div class="problem-form mt-2">
                        <h4>{{ 'carpool.report_problem' | translate }}</h4>
                        <textarea [(ngModel)]="problemComment"
                                  name="problemComment"
                                  rows="3"
                                  placeholder="{{ 'carpool.problem_comment_placeholder' | translate }}"
                                  minlength="10"
                                  maxlength="500"
                                  class="form-control"></textarea>
                        <small>{{ problemComment.length }}/500</small>
                        <div class="button-group mt-2">
                          <button (click)="submitProblem(trip.carpoolId)"
                                  class="btn btn-warning"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'common.submit' | translate }}
                          </button>
                          <button (click)="cancelProblemForm()"
                                  class="btn btn-secondary">
                            {{ 'common.cancel' | translate }}
                          </button>
                        </div>
                      </div>
                    }

                    <!-- Review button (only after validation) -->
                    @if (trip.status === CarpoolStatus.Completed && hasValidated(trip.carpoolId) && !hasReviewed(trip.carpoolId)) {
                      <button (click)="openReviewForm(trip)" class="btn btn-secondary btn-sm mt-2">
                        ⭐ {{ 'review.leave_review' | translate }}
                      </button>
                    }

                    @if (showReviewForm() === trip.carpoolId) {
                      <form (ngSubmit)="submitReview()" class="review-form mt-2">
                        <div class="form-group">
                          <label>{{ 'review.rating' | translate }}</label>
                          <div class="star-rating">
                            @for (star of [5, 4, 3, 2, 1]; track star) {
                              <label>
                                <input type="radio"
                                       name="rating"
                                       [(ngModel)]="reviewForm.note"
                                       [value]="star"
                                       required>
                                <span>{{ getStars(star) }}</span>
                              </label>
                            }
                          </div>
                        </div>

                        <div class="form-group">
                          <label>{{ 'review.comment' | translate }}</label>
                          <textarea [(ngModel)]="reviewForm.comment"
                                    name="comment"
                                    rows="3"
                                    minlength="10"
                                    maxlength="500"
                                    required></textarea>
                          <small>{{ reviewForm.comment.length }}/500</small>
                        </div>

                        <div class="button-group">
                          <button type="submit"
                                  class="btn btn-primary"
                                  [disabled]="reviewLoading()">
                            {{ reviewLoading() ? ('common.loading' | translate) : ('common.submit' | translate) }}
                          </button>
                          <button type="button"
                                  (click)="cancelReview()"
                                  class="btn btn-secondary">
                            {{ 'common.cancel' | translate }}
                          </button>
                        </div>
                      </form>
                    }

                    @if (hasReviewed(trip.carpoolId)) {
                      <p class="review-submitted">✅ {{ 'review.already_reviewed' | translate }}</p>
                    }
                  </div>
                }
              } @else {
                <p>{{ 'carpool.no_trips_passenger' | translate }}</p>
              }
            </div>
          }
        </div>

        <div class="card mt-3">
          <h2>{{ 'review.reviews' | translate }}</h2>
          @if (reviews().length > 0) {
            <div class="reviews-list">
              @for (review of reviews(); track review.reviewId) {
                <div class="review-card">
                  <div class="review-header">
                    <div class="review-author">
                      <strong>{{ review.authorUsername }}</strong>
                      <span class="review-rating">{{ getStars(review.rating) }}</span>
                    </div>
                    <span class="review-date">{{ review.createdAt | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>
              }
            </div>
          } @else {
            <p>{{ 'review.no_reviews' | translate }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-info p {
      margin: 0.8rem 0;
    }

    .credit-amount {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--primary-green);
    }

    .role-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
    }

    .vehicle-card {
      background-color: var(--light-gray);
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 5px;
    }

    .trip-card {
      background-color: var(--very-light-green);
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 5px;
    }

    .trips-section h3 {
      margin-top: 1.5rem;
    }

    .review-form {
      background-color: var(--very-light-green);
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 5px;
      border: 1px solid var(--primary-green);
    }

    .star-rating {
      display: flex;
      gap: 0.5rem;
      flex-direction: row-reverse;
      justify-content: flex-end;
    }

    .star-rating label {
      cursor: pointer;
    }

    .star-rating input[type="radio"] {
      display: none;
    }

    .star-rating input[type="radio"]:checked + span {
      color: gold;
      filter: brightness(1.2);
    }

    .star-rating label:hover span {
      opacity: 0.7;
    }

    .review-submitted {
      color: var(--success-green);
      font-weight: bold;
      margin-top: 0.5rem;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .trip-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
      border: none;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
      border: none;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }

    .badge-success {
      background-color: #28a745;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      font-weight: bold;
    }

    .badge-danger {
      background-color: #dc3545;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      font-weight: bold;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #000;
      border: none;
    }

    .btn-warning:hover:not(:disabled) {
      background-color: #e0a800;
    }

    .problem-form {
      background-color: #fff3cd;
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 5px;
      border: 1px solid #ffc107;
    }

    .problem-form h4 {
      margin-top: 0;
      color: #856404;
    }

    .problem-form textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ffc107;
      border-radius: 4px;
      font-family: inherit;
    }

    .problem-form small {
      display: block;
      margin-top: 0.25rem;
      color: #856404;
    }

    .reviews-list {
      margin-top: 1rem;
    }

    .review-card {
      background-color: var(--light-gray);
      padding: 1.5rem;
      margin: 1rem 0;
      border-radius: 8px;
      border-left: 4px solid var(--primary-green);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .review-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .review-rating {
      font-size: 1.2rem;
      color: gold;
    }

    .review-date {
      color: var(--dark-green);
      font-size: 0.9rem;
    }

    .review-comment {
      margin: 0;
      line-height: 1.6;
      color: var(--text-dark);
    }
  `]
})
export class ProfileComponent implements OnInit {
  // Expose enums to template
  UserRole = UserRole;
  CarpoolStatus = CarpoolStatus;

  // Signal-based state
  user = signal<User | null>(null);
  vehicles = signal<Vehicle[]>([]);
  myTrips = signal<{ asDriver: Carpool[], asPassenger: Carpool[] }>({ asDriver: [], asPassenger: [] });
  reviews = signal<Review[]>([]);
  loading = signal(true);
  showAddVehicle = signal(false);
  newVehicle: CreateVehicleForm = {
    brandId: 0,
    model: '',
    registrationNumber: '',
    energyType: '',
    color: '',
    seatCount: 4
  };

  // Review signals
  showReviewForm = signal<number | null>(null);
  submittedReviews = signal<Set<number>>(new Set());
  reviewLoading = signal(false);

  // Review form data
  reviewForm: CreateReview = {
    comment: '',
    note: 0,
    targetUserId: 0,
    carpoolId: undefined
  };

  // Trip management signals
  actioningTripId = signal<number | null>(null);

  // Trip validation signals
  validatedTrips = signal<Set<number>>(new Set());
  showProblemForm = signal<number | null>(null);
  problemComment = '';

  constructor(
    private userService: UserService,
    private carpoolService: CarpoolService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
    this.loadMyTrips();
    this.loadReviews();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        // Update localStorage to keep auth service in sync
        localStorage.setItem('currentUser', JSON.stringify(data));
        // Refresh auth service signal
        this.authService.refreshCurrentUser();
      },
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
      },
    });
  }

  loadMyTrips() {
    this.carpoolService.getMyTrips().subscribe({
      next: (data) => {
        this.myTrips.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      }
    });
  }

  loadReviews() {
    const userId = this.user()?.userId;
    if (!userId) {
      // If user not loaded yet, retry after profile loads
      setTimeout(() => {
        if (this.user()?.userId) {
          this.loadReviews();
        }
      }, 500);
      return;
    }

    this.reviewService.getByUser(userId).subscribe({
      next: (data) => {
        this.reviews.set(data);
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviews.set([]);
      }
    });
  }

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  becomeDriver() {
    this.userService.addRole(RoleId.Driver).subscribe({
      next: (response: any) => {
        // Update token if returned
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        alert(this.translate.instant('messages.operation_successful'));
        this.loadProfile();
      },
    });
  }

  addVehicle() {
    this.userService.addVehicle(this.newVehicle).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.showAddVehicle.set(false);
        this.loadVehicles();
      },
    });
  }

  getStars(count: number): string {
    return '⭐'.repeat(count);
  }

  hasReviewed(carpoolId: number): boolean {
    return this.submittedReviews().has(carpoolId);
  }

  openReviewForm(trip: Carpool) {
    const currentUserId = this.user()?.userId || 0;
    const isPassenger = trip.userId !== currentUserId;

    if (!isPassenger) {
      // Driver review not implemented in Phase 1
      alert(this.translate.instant('review.driver_review_coming_soon'));
      return;
    }

    this.showReviewForm.set(trip.carpoolId);
    this.reviewForm = {
      comment: '',
      note: 0,
      targetUserId: trip.userId,  // Review the driver
      carpoolId: trip.carpoolId
    };
  }

  submitReview() {
    this.reviewLoading.set(true);

    this.reviewService.create(this.reviewForm).subscribe({
      next: () => {
        alert(this.translate.instant('review.review_submitted_success'));

        // Mark as reviewed
        const reviewed = new Set(this.submittedReviews());
        reviewed.add(this.reviewForm.carpoolId!);
        this.submittedReviews.set(reviewed);

        // Close form
        this.showReviewForm.set(null);
        this.reviewLoading.set(false);

        // Refresh profile
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.reviewLoading.set(false);
      }
    });
  }

  cancelReview() {
    this.showReviewForm.set(null);
  }

  startTrip(carpoolId: number) {
    if (confirm(this.translate.instant('carpool.start') + ' ?')) {
      this.actioningTripId.set(carpoolId);

      this.carpoolService.start(carpoolId).subscribe({
        next: () => {
          alert(this.translate.instant('messages.operation_successful'));
          this.actioningTripId.set(null);
          this.loadMyTrips();
        },
        error: (err) => {
          alert(err.error?.message || this.translate.instant('messages.error_occurred'));
          this.actioningTripId.set(null);
        }
      });
    }
  }

  completeTrip(carpoolId: number) {
    if (confirm(this.translate.instant('carpool.complete') + ' ?')) {
      this.actioningTripId.set(carpoolId);

      this.carpoolService.complete(carpoolId).subscribe({
        next: () => {
          alert(this.translate.instant('messages.operation_successful'));
          this.actioningTripId.set(null);
          this.loadMyTrips();
        },
        error: (err) => {
          alert(err.error?.message || this.translate.instant('messages.error_occurred'));
          this.actioningTripId.set(null);
        }
      });
    }
  }

  cancelTrip(carpoolId: number) {
    if (confirm(this.translate.instant('messages.confirm_cancel'))) {
      this.actioningTripId.set(carpoolId);

      this.carpoolService.cancel(carpoolId).subscribe({
        next: () => {
          alert(this.translate.instant('messages.operation_successful'));
          this.actioningTripId.set(null);
          this.loadMyTrips();
        },
        error: (err) => {
          alert(err.error?.message || this.translate.instant('messages.error_occurred'));
          this.actioningTripId.set(null);
        }
      });
    }
  }

  validateTripOk(carpoolId: number) {
    if (confirm(this.translate.instant('carpool.validate_trip_confirm'))) {
      this.actioningTripId.set(carpoolId);

      this.carpoolService.validateTrip(carpoolId, true).subscribe({
        next: () => {
          alert(this.translate.instant('carpool.trip_validated_success'));

          // Mark as validated
          const validated = new Set(this.validatedTrips());
          validated.add(carpoolId);
          this.validatedTrips.set(validated);

          this.actioningTripId.set(null);
          this.loadMyTrips();
        },
        error: (err) => {
          alert(err.error?.message || this.translate.instant('messages.error_occurred'));
          this.actioningTripId.set(null);
        }
      });
    }
  }

  openProblemForm(carpoolId: number) {
    this.showProblemForm.set(carpoolId);
    this.problemComment = '';
  }

  submitProblem(carpoolId: number) {
    if (!this.problemComment || this.problemComment.trim().length < 10) {
      alert(this.translate.instant('carpool.problem_comment_required'));
      return;
    }

    this.actioningTripId.set(carpoolId);

    this.carpoolService.validateTrip(carpoolId, false, this.problemComment).subscribe({
      next: () => {
        alert(this.translate.instant('carpool.problem_reported_success'));
        this.showProblemForm.set(null);
        this.problemComment = '';
        this.actioningTripId.set(null);
        this.loadMyTrips();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.actioningTripId.set(null);
      }
    });
  }

  cancelProblemForm() {
    this.showProblemForm.set(null);
    this.problemComment = '';
  }

  hasValidated(carpoolId: number): boolean {
    return this.validatedTrips().has(carpoolId);
  }
}
