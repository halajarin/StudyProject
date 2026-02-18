import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { ReviewService } from '../../../services/review.service';
import { User } from '../../../models/user.model';
import { UserRole } from '../../../models/role.enum';
import { Carpool, CarpoolStatus } from '../../../models/carpool.model';
import { Review, CreateReview } from '../../../models/review.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>{{ 'navigation.my_trips' | translate }}</h1>
        @if (hasRole(UserRole.Driver)) {
          <a routerLink="/create-carpool" class="btn btn-primary create-carpool-btn">
            {{ 'navigation.create_carpool' | translate }}
          </a>
        }
      </div>

      @if (loading()) {
        <div class="card"><p>{{ 'common.loading' | translate }}</p></div>
      } @else {
        <div class="tabs">
          <button class="tab" [class.active]="activeTripsTab() === 'driver'" (click)="activeTripsTab.set('driver')">
            {{ 'profile.tab_driver' | translate }}
            <span class="tab-count">{{ myTrips().asDriver.length }}</span>
          </button>
          <button class="tab" [class.active]="activeTripsTab() === 'passenger'" (click)="activeTripsTab.set('passenger')">
            {{ 'profile.tab_passenger' | translate }}
            <span class="tab-count">{{ myTrips().asPassenger.length }}</span>
          </button>
        </div>

        <div class="card tab-content">
          <div class="table-header">
            <div class="table-header-actions">
              <div class="filter-group">
                <label>{{ 'admin.status_label' | translate }}:</label>
                <select [ngModel]="tripStatusFilter()" (ngModelChange)="tripStatusFilter.set($event)">
                  <option value="all">{{ 'admin.filter_all' | translate }}</option>
                  <option value="Pending">{{ 'carpool.status.pending' | translate }}</option>
                  <option value="InProgress">{{ 'carpool.status.in_progress' | translate }}</option>
                  <option value="Completed">{{ 'carpool.status.completed' | translate }}</option>
                  <option value="Cancelled">{{ 'carpool.status.cancelled' | translate }}</option>
                </select>
              </div>
            </div>
            <span class="result-count">
              {{ currentFilteredTrips().length }}
              / {{ activeTripsTab() === 'driver' ? myTrips().asDriver.length : myTrips().asPassenger.length }}
            </span>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-expand"></th>
                  <th class="sortable" (click)="toggleTripSort('departureCity')">
                    {{ 'profile.column_route' | translate }} {{ getTripSortArrow('departureCity') }}
                  </th>
                  <th class="sortable" (click)="toggleTripSort('departureDate')">
                    {{ 'profile.column_date' | translate }} {{ getTripSortArrow('departureDate') }}
                  </th>
                  <th class="sortable" (click)="toggleTripSort('status')">
                    {{ 'admin.status_label' | translate }} {{ getTripSortArrow('status') }}
                  </th>
                  @if (activeTripsTab() === 'driver') {
                    <th>{{ 'profile.column_seats' | translate }}</th>
                  }
                  <th>{{ 'profile.column_actions' | translate }}</th>
                </tr>
                <tr class="filter-row">
                  <th></th>
                  <th><input class="column-filter" (input)="setTripFilter('route', $event)" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setTripFilter('departureDate', $event)" placeholder="..."></th>
                  <th></th>
                  @if (activeTripsTab() === 'driver') {
                    <th></th>
                  }
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @if (currentFilteredTrips().length === 0) {
                  <tr><td [attr.colspan]="activeTripsTab() === 'driver' ? 6 : 5" class="no-results">{{ 'profile.no_trips' | translate }}</td></tr>
                }
                @for (trip of currentFilteredTrips(); track trip.carpoolId) {
                  <tr class="clickable-row" [class.expanded]="isTripExpanded(trip.carpoolId)" (click)="toggleTripExpand(trip.carpoolId)">
                    <td class="td-expand">
                      <span class="expand-icon" [class.rotated]="isTripExpanded(trip.carpoolId)">&#9656;</span>
                    </td>
                    <td class="td-route">{{ trip.departureCity }} → {{ trip.arrivalCity }}</td>
                    <td class="td-date">{{ trip.departureDate | date:'dd/MM/yyyy' }} {{ trip.departureTime }}</td>
                    <td>
                      <span class="status-badge status-{{ getCancelDisplayStatus(trip).class }}">
                        {{ getCancelDisplayStatus(trip).labelKey | translate }}
                      </span>
                    </td>
                    @if (activeTripsTab() === 'driver') {
                      <td class="td-seats">{{ trip.totalSeats - trip.availableSeats }} / {{ trip.totalSeats }}</td>
                    }
                    <td class="td-actions" (click)="$event.stopPropagation()">
                      <!-- Driver tab actions -->
                      @if (activeTripsTab() === 'driver') {
                        @if (trip.status === CarpoolStatus.Pending) {
                          <a [routerLink]="['/edit-carpool', trip.carpoolId]" class="btn-sm btn-secondary">
                            {{ 'carpool.edit' | translate }}
                          </a>
                          <button (click)="startTrip(trip.carpoolId)" class="btn-sm btn-primary"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.start' | translate }}
                          </button>
                          <button (click)="cancelTrip(trip.carpoolId)" class="btn-sm btn-danger"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.cancel_trip' | translate }}
                          </button>
                        }
                        @if (trip.status === CarpoolStatus.InProgress) {
                          <button (click)="completeTrip(trip.carpoolId)" class="btn-sm btn-success"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.complete' | translate }}
                          </button>
                          <button (click)="cancelTrip(trip.carpoolId)" class="btn-sm btn-danger"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.cancel_trip' | translate }}
                          </button>
                        }
                        @if (trip.status === CarpoolStatus.Completed) {
                          <span class="badge badge-success">{{ 'carpool.status.completed' | translate }}</span>
                          @if (reviews().length > 0) {
                            <a routerLink="/reviews" [queryParams]="{ carpoolId: trip.carpoolId }" class="btn-sm btn-outline-primary">
                              {{ 'profile.view_reviews' | translate }}
                            </a>
                          }
                        }
                        @if (trip.status === CarpoolStatus.Cancelled) {
                          <span class="badge badge-danger">{{ 'carpool.status.cancelled' | translate }}</span>
                        }
                      }
                      <!-- Passenger tab actions -->
                      @if (activeTripsTab() === 'passenger') {
                        @if (trip.status === CarpoolStatus.Pending) {
                          <button (click)="cancelParticipation(trip.carpoolId)" class="btn-sm btn-danger"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.cancel_participation' | translate }}
                          </button>
                        }
                        @if (trip.status === CarpoolStatus.Completed && !hasValidated(trip.carpoolId)) {
                          <button (click)="validateTripOk(trip.carpoolId)" class="btn-sm btn-success"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.validate_trip' | translate }}
                          </button>
                          <button (click)="openProblemForm(trip.carpoolId)" class="btn-sm btn-warning"
                                  [disabled]="actioningTripId() === trip.carpoolId">
                            {{ 'carpool.report_problem' | translate }}
                          </button>
                        }
                        @if (trip.status === CarpoolStatus.Completed && hasValidated(trip.carpoolId) && !hasReviewed(trip.carpoolId)) {
                          <button (click)="openReviewForm(trip)" class="btn-sm btn-secondary">
                            {{ 'review.leave_review' | translate }}
                          </button>
                        }
                        @if (hasReviewed(trip.carpoolId)) {
                          <span class="review-done">{{ 'review.already_reviewed' | translate }}</span>
                        }
                      }
                    </td>
                  </tr>
                  <!-- Expanded detail row -->
                  @if (isTripExpanded(trip.carpoolId)) {
                    <tr class="stats-row">
                      <td [attr.colspan]="activeTripsTab() === 'driver' ? 6 : 5">
                        <div class="trip-detail">
                          <div class="stats-cards-grid">
                            <div class="detail-stat-card">
                              <h4>{{ 'profile.trip_detail_departure' | translate }}</h4>
                              <div class="stat-main-value-sm">{{ trip.departureCity }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ trip.departureLocation }}</span>
                                <span class="stat-item">{{ trip.departureDate | date:'dd/MM/yyyy' }} {{ 'common.at' | translate }} {{ trip.departureTime }}</span>
                              </div>
                            </div>
                            <div class="detail-stat-card">
                              <h4>{{ 'profile.trip_detail_arrival' | translate }}</h4>
                              <div class="stat-main-value-sm">{{ trip.arrivalCity }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ trip.arrivalLocation }}</span>
                                <span class="stat-item">{{ trip.arrivalDate | date:'dd/MM/yyyy' }} {{ 'common.at' | translate }} {{ trip.arrivalTime }}</span>
                              </div>
                            </div>
                            <div class="detail-stat-card">
                              <h4>{{ 'profile.trip_detail_vehicle' | translate }}</h4>
                              <div class="stat-main-value-sm">
                                {{ trip.vehicleBrand }} {{ trip.vehicleModel }}
                                @if (trip.isEcological) {
                                  <span class="badge-eco">EV</span>
                                }
                              </div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ trip.vehicleEnergyType === 'Electric' ? '⚡' : trip.vehicleEnergyType === 'Hybrid' ? '🔋' : '🌿' }} {{ trip.vehicleEnergyType }}</span>
                                <span class="stat-item">{{ trip.vehicleColor }}</span>
                              </div>
                            </div>
                            <div class="detail-stat-card">
                              <h4>{{ 'profile.trip_detail_trip' | translate }}</h4>
                              <div class="stat-main-value-sm">{{ 'profile.price_info' | translate:{ price: trip.pricePerPerson } }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ 'profile.seats_info' | translate:{ available: trip.availableSeats, total: trip.totalSeats } }}</span>
                                @if (trip.estimatedDurationMinutes) {
                                  <span class="stat-item">{{ 'profile.duration_info' | translate:{ duration: trip.estimatedDurationMinutes } }}</span>
                                }
                              </div>
                            </div>
                            @if (activeTripsTab() === 'passenger') {
                              <div class="detail-stat-card">
                                <h4>{{ 'profile.trip_detail_driver' | translate }}</h4>
                                <div class="stat-main-value-sm">{{ trip.driverUsername }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item">{{ trip.driverAverageRating ? trip.driverAverageRating.toFixed(1) : '-' }}</span>
                                </div>
                              </div>
                            }
                          </div>

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

                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Review modal -->
      @if (showReviewForm() !== null) {
        <div class="modal-overlay" (click)="cancelReview()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ 'review.leave_review' | translate }}</h3>
            <form (ngSubmit)="submitReview()">
              <div class="form-group">
                <label>{{ 'review.rating' | translate }}</label>
                <div class="star-rating">
                  @for (star of [5, 4, 3, 2, 1]; track star) {
                    <label>
                      <input type="radio" name="rating" [(ngModel)]="reviewForm.note" [value]="star" required>
                      <span>{{ getStars(star) }}</span>
                    </label>
                  }
                </div>
              </div>
              <div class="form-group">
                <label>{{ 'review.comment' | translate }}</label>
                <textarea [(ngModel)]="reviewForm.comment" name="comment" rows="3"
                          minlength="10" maxlength="500" required></textarea>
                <small>{{ reviewForm.comment.length }}/500</small>
              </div>
              <div class="button-group">
                <button type="submit" class="btn btn-primary" [disabled]="reviewLoading()">
                  {{ reviewLoading() ? ('common.loading' | translate) : ('common.submit' | translate) }}
                </button>
                <button type="button" (click)="cancelReview()" class="btn btn-secondary">
                  {{ 'common.cancel' | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
    }

    .create-carpool-btn {
      text-decoration: none;
    }

    .data-table { min-width: 650px; }

    .trip-detail {
      padding: 1rem;
    }

    .td-route {
      font-weight: 600;
      color: var(--dark-green);
      white-space: nowrap;
    }

    .td-date {
      white-space: nowrap;
      font-size: 0.82rem;
      color: var(--gray);
    }

    .td-seats {
      white-space: nowrap;
      font-size: 0.85rem;
      font-weight: 600;
      text-align: center;
    }

    .td-actions {
      white-space: nowrap;
    }

    .td-actions button,
    .td-actions .badge {
      margin: 0.15rem;
    }

    .badge-eco {
      display: inline-block;
      padding: 0.1rem 0.4rem;
      margin-left: 0.3rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #e8f5e9;
      color: #2e7d32;
    }

    .review-done {
      color: #28a745;
      font-weight: 600;
      font-size: 0.82rem;
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
  `]
})
export class MyTripsComponent implements OnInit {
  UserRole = UserRole;
  CarpoolStatus = CarpoolStatus;

  user = signal<User | null>(null);
  myTrips = signal<{ asDriver: Carpool[], asPassenger: Carpool[] }>({ asDriver: [], asPassenger: [] });
  reviews = signal<Review[]>([]);
  loading = signal(true);

  // Review signals
  showReviewForm = signal<number | null>(null);
  submittedReviews = signal<Set<number>>(new Set());
  reviewLoading = signal(false);
  reviewForm: CreateReview = {
    comment: '',
    note: 0,
    targetUserId: 0,
    carpoolId: undefined
  };

  // Trip management
  actioningTripId = signal<number | null>(null);

  // Trip validation
  validatedTrips = signal<Set<number>>(new Set());
  showProblemForm = signal<number | null>(null);
  problemComment = '';

  // Trips table — tabs, sort, filter, expand
  activeTripsTab = signal<'driver' | 'passenger'>('driver');
  tripStatusFilter = signal<string>('all');
  tripSortColumn = signal<string>('');
  tripSortDirection = signal<'asc' | 'desc'>('asc');
  tripColumnFilters = signal<Record<string, string>>({});
  expandedTripIds = signal<Set<number>>(new Set());

  filteredDriverTrips = computed(() => this.filterAndSortTrips(this.myTrips().asDriver));
  filteredPassengerTrips = computed(() => this.filterAndSortTrips(this.myTrips().asPassenger));
  currentFilteredTrips = computed(() =>
    this.activeTripsTab() === 'driver' ? this.filteredDriverTrips() : this.filteredPassengerTrips()
  );

  constructor(
    private userService: UserService,
    private carpoolService: CarpoolService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadMyTrips();
  }

  // --- Data loading ---

  loadUser() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.loadReviews();
      },
    });
  }

  loadMyTrips() {
    this.carpoolService.getMyTrips().subscribe({
      next: (data) => {
        this.myTrips.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReviews() {
    const userId = this.user()?.userId;
    if (!userId) return;
    this.reviewService.getByUser(userId).subscribe({
      next: (data) => this.reviews.set(data),
      error: () => this.reviews.set([])
    });
  }

  // --- Roles ---

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  getStars(count: number): string {
    return '⭐'.repeat(count);
  }

  // --- Trips table: sort, filter, expand ---

  toggleTripSort(column: string) {
    if (this.tripSortColumn() === column) {
      this.tripSortDirection.set(this.tripSortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.tripSortColumn.set(column);
      this.tripSortDirection.set('asc');
    }
  }

  getTripSortArrow(column: string): string {
    if (this.tripSortColumn() !== column) return '';
    return this.tripSortDirection() === 'asc' ? '▲' : '▼';
  }

  setTripFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.tripColumnFilters.set({ ...this.tripColumnFilters(), [column]: value });
  }

  toggleTripExpand(carpoolId: number) {
    const current = new Set(this.expandedTripIds());
    if (current.has(carpoolId)) {
      current.delete(carpoolId);
    } else {
      current.add(carpoolId);
    }
    this.expandedTripIds.set(current);
  }

  isTripExpanded(carpoolId: number): boolean {
    return this.expandedTripIds().has(carpoolId);
  }

  private filterAndSortTrips(trips: Carpool[]): Carpool[] {
    const status = this.tripStatusFilter();
    const filters = this.tripColumnFilters();
    const sortCol = this.tripSortColumn();
    const sortDir = this.tripSortDirection();

    let result = trips;
    if (status !== 'all') result = result.filter(t => t.status === status);

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const lower = value.toLowerCase();
      result = result.filter(t => {
        if (key === 'route') {
          return `${t.departureCity} ${t.arrivalCity}`.toLowerCase().includes(lower);
        }
        const val = (t as any)[key];
        return String(val ?? '').toLowerCase().includes(lower);
      });
    }

    if (sortCol) {
      result = [...result].sort((a, b) => {
        const valA = (a as any)[sortCol];
        const valB = (b as any)[sortCol];
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        let cmp: number;
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }

  getStatusLabel(status: CarpoolStatus): string {
    switch (status) {
      case CarpoolStatus.Pending: return 'carpool.status.pending';
      case CarpoolStatus.InProgress: return 'carpool.status.in_progress';
      case CarpoolStatus.Completed: return 'carpool.status.completed';
      case CarpoolStatus.Cancelled: return 'carpool.status.cancelled';
      default: return 'carpool.status.pending';
    }
  }

  getCancelDisplayStatus(trip: Carpool): { labelKey: string; class: string } {
    // Passenger tab: participation cancelled by passenger
    if (this.activeTripsTab() === 'passenger' && trip.participationStatus === 'Cancelled') {
      return { labelKey: 'carpool.status.cancelled_by_passenger', class: 'cancelled' };
    }
    // Passenger tab: carpool cancelled by driver
    if (this.activeTripsTab() === 'passenger' && trip.status === CarpoolStatus.Cancelled) {
      return { labelKey: 'carpool.status.cancelled_by_driver', class: 'cancelled' };
    }
    // Driver tab: carpool cancelled by driver
    if (this.activeTripsTab() === 'driver' && trip.status === CarpoolStatus.Cancelled) {
      return { labelKey: 'carpool.status.cancelled_by_driver', class: 'cancelled' };
    }
    // Default: use normal status
    return { labelKey: this.getStatusLabel(trip.status), class: trip.status.toLowerCase() };
  }

  // --- Driver actions ---

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

  // --- Passenger actions ---

  cancelParticipation(carpoolId: number) {
    if (confirm(this.translate.instant('carpool.cancel_participation_confirm'))) {
      this.actioningTripId.set(carpoolId);
      this.carpoolService.cancel(carpoolId).subscribe({
        next: () => {
          alert(this.translate.instant('carpool.participation_cancelled_success'));
          this.actioningTripId.set(null);
          this.loadMyTrips();
          this.loadUser();
          this.authService.refreshCurrentUser();
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

  hasValidated(carpoolId: number): boolean {
    return this.validatedTrips().has(carpoolId);
  }

  // --- Problem form ---

  openProblemForm(carpoolId: number) {
    this.showProblemForm.set(carpoolId);
    this.problemComment = '';
    const expanded = new Set(this.expandedTripIds());
    expanded.add(carpoolId);
    this.expandedTripIds.set(expanded);
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

  // --- Review form ---

  hasReviewed(carpoolId: number): boolean {
    return this.submittedReviews().has(carpoolId);
  }

  openReviewForm(trip: Carpool) {
    this.showReviewForm.set(trip.carpoolId);
    this.reviewForm = {
      comment: '',
      note: 0,
      targetUserId: trip.userId,
      carpoolId: trip.carpoolId
    };
  }

  submitReview() {
    this.reviewLoading.set(true);
    this.reviewService.create(this.reviewForm).subscribe({
      next: () => {
        alert(this.translate.instant('review.review_submitted_success'));
        const reviewed = new Set(this.submittedReviews());
        reviewed.add(this.reviewForm.carpoolId!);
        this.submittedReviews.set(reviewed);
        this.showReviewForm.set(null);
        this.reviewLoading.set(false);
        this.loadUser();
        this.authService.refreshCurrentUser();
        this.loadReviews();
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
}
