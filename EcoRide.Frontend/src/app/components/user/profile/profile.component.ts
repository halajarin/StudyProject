import { Component, OnInit, signal, computed } from '@angular/core';
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

            <div class="credits-section">
              <h3>{{ 'user.add_credits' | translate }}</h3>
              <div class="credits-options">
                @for (option of creditOptions; track option) {
                  <button (click)="addCredits(option)"
                          class="btn btn-credit"
                          [disabled]="addingCredits()">
                    +{{ option }} {{ 'common.credits' | translate }}
                  </button>
                }
              </div>
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
              <div class="vehicle-actions">
                <button (click)="showAddVehicle.set(!showAddVehicle())" class="btn btn-secondary">
                  {{ showAddVehicle() ? ('common.cancel' | translate) : ('user.add_vehicle' | translate) }}
                </button>
                <a routerLink="/create-carpool" class="btn btn-primary">
                  ➕ {{ 'navigation.create_carpool' | translate }}
                </a>
              </div>

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

        <!-- My Trips — tabbed table -->
        <h2 class="section-title">{{ 'navigation.my_trips' | translate }}</h2>
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
                    <th>{{ 'profile.column_actions' | translate }}</th>
                  </tr>
                  <tr class="filter-row">
                    <th></th>
                    <th><input class="column-filter" (input)="setTripFilter('route', $event)" placeholder="..."></th>
                    <th><input class="column-filter" (input)="setTripFilter('departureDate', $event)" placeholder="..."></th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @if (currentFilteredTrips().length === 0) {
                    <tr><td colspan="5" class="no-results">{{ 'profile.no_trips' | translate }}</td></tr>
                  }
                  @for (trip of currentFilteredTrips(); track trip.carpoolId) {
                    <tr class="clickable-row" [class.expanded]="isTripExpanded(trip.carpoolId)" (click)="toggleTripExpand(trip.carpoolId)">
                      <td class="td-expand">
                        <span class="expand-icon" [class.rotated]="isTripExpanded(trip.carpoolId)">&#9656;</span>
                      </td>
                      <td class="td-route">{{ trip.departureCity }} → {{ trip.arrivalCity }}</td>
                      <td class="td-date">{{ trip.departureDate | date:'dd/MM/yyyy' }} {{ trip.departureTime }}</td>
                      <td>
                        <span class="status-badge status-{{ trip.status.toLowerCase() }}">
                          {{ getStatusLabel(trip.status) | translate }}
                        </span>
                      </td>
                      <td class="td-actions" (click)="$event.stopPropagation()">
                        <!-- Driver tab actions -->
                        @if (activeTripsTab() === 'driver') {
                          @if (trip.status === CarpoolStatus.Pending) {
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
                              <a routerLink="/reviews" class="btn-sm btn-outline-primary">
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
                              ⭐ {{ 'review.leave_review' | translate }}
                            </button>
                          }
                          @if (hasReviewed(trip.carpoolId)) {
                            <span class="review-done">✅ {{ 'review.already_reviewed' | translate }}</span>
                          }
                        }
                      </td>
                    </tr>
                    <!-- Expanded detail row -->
                    @if (isTripExpanded(trip.carpoolId)) {
                      <tr class="stats-row">
                        <td colspan="5">
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
                                  <span class="stat-item">{{ trip.vehicleEnergyType }}</span>
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
                                    <span class="stat-item">⭐ {{ trip.driverAverageRating ? trip.driverAverageRating.toFixed(1) : '-' }}</span>
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
              <h3>⭐ {{ 'review.leave_review' | translate }}</h3>
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

    .credits-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
    }

    .credits-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn-credit {
      background-color: var(--primary-green);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .btn-credit:hover:not(:disabled) {
      background-color: var(--dark-green);
    }

    .btn-credit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    /* --- Section title --- */

    .section-title {
      margin: 1.5rem 0 0.5rem;
      font-size: 1.3rem;
    }

    /* --- Tabs --- */

    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 0;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--light-gray);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      background: white;
      color: var(--gray);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--dark-green);
      background: var(--very-light-green);
    }

    .tab.active {
      color: var(--dark-green);
      background: white;
      border-color: var(--light-gray);
      position: relative;
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: white;
    }

    .tab-count {
      background: var(--light-gray);
      color: var(--gray);
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .tab.active .tab-count {
      background: var(--primary-green);
      color: white;
    }

    .tab-content {
      border-radius: 0 10px 10px 10px;
      margin-top: 0;
    }

    /* --- Table header & filters --- */

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .table-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .result-count {
      font-size: 0.85rem;
      color: var(--gray);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .filter-group label {
      font-size: 0.85rem;
      color: var(--gray);
      white-space: nowrap;
    }

    .filter-group select {
      padding: 0.3rem 0.5rem;
      border: 1px solid var(--light-gray);
      border-radius: 6px;
      font-size: 0.85rem;
      background: white;
      cursor: pointer;
    }

    /* --- Table --- */

    .table-scroll {
      overflow-x: auto;
      margin: 1rem -0.5rem 0;
      padding: 0 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: var(--primary-green) transparent;
    }

    .table-scroll::-webkit-scrollbar { height: 6px; }
    .table-scroll::-webkit-scrollbar-track { background: transparent; }
    .table-scroll::-webkit-scrollbar-thumb { background: var(--primary-green); border-radius: 3px; }

    .data-table {
      width: 100%;
      min-width: 650px;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.55rem 0.6rem;
      text-align: left;
      border-bottom: 1px solid var(--light-gray);
    }

    .data-table th {
      background-color: var(--dark-green);
      color: var(--white);
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .filter-row th {
      background-color: var(--dark-green);
      padding: 0.2rem 0.3rem;
    }

    .column-filter {
      width: 100%;
      box-sizing: border-box;
      font-size: 0.75rem;
      padding: 0.25rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .column-filter::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .column-filter:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.25);
    }

    /* --- Expandable rows --- */

    .th-expand { width: 2rem; }

    .td-expand {
      width: 2rem;
      text-align: center;
    }

    .expand-icon {
      display: inline-block;
      font-size: 0.9rem;
      color: var(--primary-green);
      transition: transform 0.2s ease;
    }

    .expand-icon.rotated {
      transform: rotate(90deg);
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: var(--very-light-green);
    }

    .clickable-row.expanded {
      background-color: var(--very-light-green);
    }

    .stats-row td {
      padding: 0 !important;
      background-color: #f8faf8;
    }

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

    .td-actions {
      white-space: nowrap;
    }

    .td-actions button,
    .td-actions .badge {
      margin: 0.15rem;
    }

    .no-results {
      text-align: center;
      color: var(--gray);
      padding: 2rem;
    }

    /* --- Status badges --- */

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-pending { background: #fff3e0; color: #e65100; }
    .status-inprogress { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }

    /* --- Detail cards grid --- */

    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 0.75rem;
    }

    .detail-stat-card {
      background: white;
      border: 1px solid var(--light-gray);
      border-radius: 10px;
      padding: 0.75rem;
      text-align: center;
    }

    .detail-stat-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      color: var(--medium-gray);
      text-transform: uppercase;
    }

    .stat-main-value-sm {
      font-size: 1.1rem;
      font-weight: bold;
      color: var(--primary-green);
      margin-bottom: 0.25rem;
    }

    .stat-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-item {
      font-size: 0.8rem;
      color: var(--dark-gray);
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

    /* --- Buttons --- */

    .btn-sm {
      padding: 0.3rem 0.8rem;
      font-size: 0.85rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
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
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .badge-danger {
      background-color: #dc3545;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #000;
      border: none;
    }

    .btn-warning:hover:not(:disabled) {
      background-color: #e0a800;
    }

    /* --- Forms (problem / review) --- */

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

    .button-group {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    /* --- Vehicle actions --- */

    .vehicle-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    /* --- Outline button --- */

    .btn-outline-primary {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      font-size: 0.85rem;
      border: 1px solid var(--primary-green);
      border-radius: 5px;
      color: var(--primary-green);
      background: transparent;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-outline-primary:hover {
      background: var(--primary-green);
      color: white;
    }

    /* --- Review modal --- */

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 10px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--dark-green);
    }
  `]
})
export class ProfileComponent implements OnInit {
  UserRole = UserRole;
  CarpoolStatus = CarpoolStatus;

  // Profile state
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
  reviewForm: CreateReview = {
    comment: '',
    note: 0,
    targetUserId: 0,
    carpoolId: undefined
  };

  // Trip management
  actioningTripId = signal<number | null>(null);

  // Credits
  creditOptions = [10, 20, 50];
  addingCredits = signal(false);

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
    this.loadProfile();
    this.loadVehicles();
    this.loadMyTrips();
    this.loadReviews();
  }

  // --- Data loading ---

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
        this.authService.refreshCurrentUser();
      },
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => this.vehicles.set(data),
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
    if (!userId) {
      setTimeout(() => {
        if (this.user()?.userId) this.loadReviews();
      }, 500);
      return;
    }
    this.reviewService.getByUser(userId).subscribe({
      next: (data) => this.reviews.set(data),
      error: () => this.reviews.set([])
    });
  }

  // --- Roles & credits ---

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  becomeDriver() {
    this.userService.addRole(RoleId.Driver).subscribe({
      next: (response: any) => {
        if (response.token) localStorage.setItem('token', response.token);
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

  addCredits(amount: number) {
    this.addingCredits.set(true);
    this.userService.addCredits(amount).subscribe({
      next: () => {
        alert(this.translate.instant('user.credits_added_success', { count: amount }));
        this.addingCredits.set(false);
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.addingCredits.set(false);
      }
    });
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
          this.loadProfile();
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
        this.loadProfile();
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
