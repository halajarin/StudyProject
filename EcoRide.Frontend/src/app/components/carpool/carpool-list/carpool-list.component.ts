import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { Carpool, SearchCarpool } from '../../../models/carpool.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carpool-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <!-- ===== SEARCH HERO ===== -->
    <div class="search-hero">
      <h1>{{ 'carpools.search_hero_title' | translate }}</h1>
      <form class="search-bar" (ngSubmit)="search()">
        <div class="search-field">
          <span class="search-icon">&#128205;</span>
          <input type="text" [(ngModel)]="searchForm.departureCity" name="departureCity"
                 [placeholder]="'carpools.placeholder_departure' | translate">
        </div>
        <div class="search-separator"></div>
        <div class="search-field">
          <span class="search-icon">&#128204;</span>
          <input type="text" [(ngModel)]="searchForm.arrivalCity" name="arrivalCity"
                 [placeholder]="'carpools.placeholder_arrival' | translate">
        </div>
        <div class="search-separator"></div>
        <div class="search-field">
          <span class="search-icon">&#128197;</span>
          <input type="date" [(ngModel)]="searchForm.departureDate" name="departureDate">
        </div>
        <button type="submit" class="btn-search">
          &#128269; {{ 'common.search' | translate }}
        </button>
      </form>
      <div class="energy-legend">
        <span class="legend-badge">{{ 'carpools.energy_legend_label' | translate }}</span>
        <span class="legend-item electric-legend">&#9889; {{ 'vehicle.types.electric' | translate }}</span>
        <span class="legend-item hybrid-legend">&#128267; {{ 'vehicle.types.hybrid' | translate }}</span>
        <span class="legend-item lpg-legend">&#127807; {{ 'vehicle.types.lpg' | translate }}</span>
      </div>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="main-content">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="filter-card">
          <div class="filter-header">
            <h3>{{ 'carpools.filters' | translate }}</h3>
            <button class="btn-clear" (click)="clearFilters()">{{ 'carpools.clear_all' | translate }}</button>
          </div>

          <!-- Sort by -->
          <div class="filter-section">
            <h4>{{ 'carpools.sort_by' | translate }}</h4>
            <label class="radio-option">
              <input type="radio" name="sortBy" value="price" [checked]="sortBy() === 'price'" (change)="sortBy.set('price')">
              <span>{{ 'carpools.sort_cheapest' | translate }}</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="sortBy" value="time" [checked]="sortBy() === 'time'" (change)="sortBy.set('time')">
              <span>{{ 'carpools.sort_earliest' | translate }}</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="sortBy" value="duration" [checked]="sortBy() === 'duration'" (change)="sortBy.set('duration')">
              <span>{{ 'carpools.sort_shortest' | translate }}</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="sortBy" value="rating" [checked]="sortBy() === 'rating'" (change)="sortBy.set('rating')">
              <span>{{ 'carpools.sort_best_rated' | translate }}</span>
            </label>
          </div>

          <!-- Energy type -->
          <div class="filter-section">
            <h4>{{ 'carpools.vehicle_energy' | translate }}</h4>
            <label class="checkbox-option">
              <input type="checkbox" [checked]="energyFilters().has('Electric')" (change)="toggleEnergy('Electric')">
              <span class="energy-tag electric-tag">&#9889; {{ 'vehicle.types.electric' | translate }}</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" [checked]="energyFilters().has('Hybrid')" (change)="toggleEnergy('Hybrid')">
              <span class="energy-tag hybrid-tag">&#128267; {{ 'vehicle.types.hybrid' | translate }}</span>
            </label>
            <label class="checkbox-option">
              <input type="checkbox" [checked]="energyFilters().has('LPG')" (change)="toggleEnergy('LPG')">
              <span class="energy-tag lpg-tag">&#127807; {{ 'vehicle.types.lpg' | translate }}</span>
            </label>
          </div>

          <!-- Max price -->
          <div class="filter-section">
            <h4>{{ 'carpools.max_price' | translate }}</h4>
            <div class="range-display">
              @if (searchForm.maxPrice) {
                <span class="range-value">{{ searchForm.maxPrice }} {{ 'common.credits' | translate }}</span>
              } @else {
                <span class="range-value muted">{{ 'carpools.no_price_limit' | translate }}</span>
              }
            </div>
            <input type="range" class="range-slider" min="0" max="50" step="1"
                   [ngModel]="searchForm.maxPrice || 50" name="maxPrice"
                   (ngModelChange)="onMaxPriceChange($event)">
          </div>

          <!-- Min rating -->
          <div class="filter-section">
            <h4>{{ 'carpools.min_rating' | translate }}</h4>
            <div class="rating-buttons">
              <button class="rating-btn" [class.active]="!searchForm.minimumRating" (click)="setMinRating(undefined)">
                {{ 'carpools.all_ratings' | translate }}
              </button>
              <button class="rating-btn" [class.active]="searchForm.minimumRating === 3" (click)="setMinRating(3)">
                3&#11088;
              </button>
              <button class="rating-btn" [class.active]="searchForm.minimumRating === 4" (click)="setMinRating(4)">
                4&#11088;
              </button>
              <button class="rating-btn" [class.active]="searchForm.minimumRating === 4.5" (click)="setMinRating(4.5)">
                4.5&#11088;
              </button>
            </div>
          </div>

          <!-- Min seats -->
          <div class="filter-section">
            <h4>{{ 'carpools.min_seats' | translate }}</h4>
            <div class="seats-buttons">
              <button class="seat-btn" [class.active]="minSeats() === 1" (click)="minSeats.set(1)">1+</button>
              <button class="seat-btn" [class.active]="minSeats() === 2" (click)="minSeats.set(2)">2+</button>
              <button class="seat-btn" [class.active]="minSeats() === 3" (click)="minSeats.set(3)">3+</button>
            </div>
          </div>
        </div>
      </aside>

      <!-- RESULTS AREA -->
      <div class="results-area">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'carpool.searching' | translate }}</p>
          </div>
        } @else if (searched()) {
          <div class="results-header">
            <span class="results-count">{{ 'carpools.trips_found' | translate:{count: filteredCarpools().length} }}</span>
            @if (searchForm.departureCity || searchForm.arrivalCity) {
              <span class="results-summary">
                {{ searchForm.departureCity }}
                @if (searchForm.departureCity && searchForm.arrivalCity) { &rarr; }
                {{ searchForm.arrivalCity }}
              </span>
            }
          </div>

          @for (carpool of filteredCarpools(); track carpool.carpoolId) {
            <div class="ride-card" (click)="openDetail(carpool)">
              <div class="ride-card-inner">
                <!-- Route timeline -->
                <div class="route-timeline">
                  <div class="timeline-point departure-point">
                    <div class="timeline-dot"></div>
                    <div class="timeline-info">
                      <span class="timeline-time">{{ carpool.departureTime }}</span>
                      <span class="timeline-city">{{ carpool.departureCity }}</span>
                      @if (carpool.departureLocation) {
                        <span class="timeline-location">{{ carpool.departureLocation }}</span>
                      }
                    </div>
                  </div>
                  <div class="timeline-line">
                    @if (carpool.estimatedDurationMinutes) {
                      <span class="timeline-duration">{{ formatDuration(carpool.estimatedDurationMinutes) }}</span>
                    }
                  </div>
                  <div class="timeline-point arrival-point">
                    <div class="timeline-dot arrival-dot"></div>
                    <div class="timeline-info">
                      <span class="timeline-time">{{ carpool.arrivalTime }}</span>
                      <span class="timeline-city">{{ carpool.arrivalCity }}</span>
                      @if (carpool.arrivalLocation) {
                        <span class="timeline-location">{{ carpool.arrivalLocation }}</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Price -->
                <div class="ride-price">
                  <span class="price-amount">{{ carpool.pricePerPerson }}</span>
                  <span class="price-unit">{{ 'common.credits' | translate }}</span>
                  <span class="price-label">{{ 'carpools.per_person' | translate }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="ride-footer">
                <span class="energy-badge" [ngClass]="getEnergyClass(carpool.vehicleEnergyType)">
                  {{ getEnergyIcon(carpool.vehicleEnergyType) }} {{ carpool.vehicleEnergyType }}
                </span>
                <span class="driver-tag">
                  <span class="driver-avatar">{{ carpool.driverUsername.charAt(0).toUpperCase() }}</span>
                  {{ carpool.driverUsername }}
                  <span class="driver-rating">&#11088; {{ carpool.driverAverageRating.toFixed(1) }}</span>
                </span>
                <span class="vehicle-tag">{{ carpool.vehicleBrand }} {{ carpool.vehicleModel }}</span>
                <span class="seats-tag" [class.almost-full]="carpool.availableSeats <= 1">
                  @if (carpool.availableSeats <= 1) {
                    {{ 'carpools.almost_full' | translate }}
                  } @else {
                    {{ 'carpools.spots_available' | translate:{count: carpool.availableSeats} }}
                  }
                </span>
                <button class="btn-details">{{ 'carpools.view_details' | translate }} &rarr;</button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">&#128663;</div>
              <h3>{{ 'carpools.no_results_title' | translate }}</h3>
              <p>{{ 'carpools.no_results_text' | translate }}</p>
            </div>
          }
        }
      </div>
    </div>

    <!-- ===== DETAIL OVERLAY ===== -->
    @if (detailPanelOpen()) {
      <div class="detail-overlay" (click)="closeDetail()"></div>
    }

    <!-- ===== DETAIL PANEL ===== -->
    <div class="detail-panel" [class.open]="detailPanelOpen()">
      @if (selectedCarpool(); as c) {
        <div class="detail-header">
          <div>
            <h2>{{ c.departureCity }} &rarr; {{ c.arrivalCity }}</h2>
            <span class="status-badge"
                  [ngClass]="'status-' + c.status.toLowerCase()">
              {{ 'carpool.status.' + getStatusKey(c.status) | translate }}
            </span>
          </div>
          <button class="btn-close-panel" (click)="closeDetail()">&times;</button>
        </div>

        <div class="detail-inner">
          <!-- LEFT COLUMN -->
          <div class="detail-left">
            <!-- Itinerary card -->
            <div class="detail-card">
              <h3>{{ 'carpools.itinerary' | translate }}</h3>
              <div class="detail-timeline">
                <div class="dt-point">
                  <div class="dt-dot"></div>
                  <div class="dt-info">
                    <span class="dt-label">{{ 'carpool.departure' | translate }}</span>
                    <span class="dt-main">{{ c.departureCity }}</span>
                    @if (c.departureLocation) {
                      <span class="dt-sub">{{ c.departureLocation }}</span>
                    }
                    <span class="dt-time">{{ c.departureDate | date:'dd/MM/yyyy' }} &middot; {{ c.departureTime }}</span>
                  </div>
                </div>
                <div class="dt-line">
                  @if (c.estimatedDurationMinutes) {
                    <span class="dt-duration">{{ 'carpools.travel_time' | translate:{duration: formatDuration(c.estimatedDurationMinutes)} }}</span>
                  }
                </div>
                <div class="dt-point">
                  <div class="dt-dot arrival"></div>
                  <div class="dt-info">
                    <span class="dt-label">{{ 'carpool.arrival' | translate }}</span>
                    <span class="dt-main">{{ c.arrivalCity }}</span>
                    @if (c.arrivalLocation) {
                      <span class="dt-sub">{{ c.arrivalLocation }}</span>
                    }
                    <span class="dt-time">{{ c.arrivalDate | date:'dd/MM/yyyy' }} &middot; {{ c.arrivalTime }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Driver card -->
            <div class="detail-card">
              <h3>{{ 'carpool.driver' | translate }}</h3>
              <div class="driver-row">
                <div class="driver-avatar-large">{{ c.driverUsername.charAt(0).toUpperCase() }}</div>
                <div class="driver-details">
                  <span class="driver-name-lg">{{ c.driverUsername }}</span>
                  <div class="driver-rating-lg">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span class="star" [class.filled]="star <= c.driverAverageRating">&#9733;</span>
                    }
                    <span class="rating-number">{{ c.driverAverageRating.toFixed(1) }}</span>
                  </div>
                  <span class="green-badge">&#127807; {{ 'carpools.green_driver' | translate }}</span>
                </div>
              </div>
            </div>

            <!-- Vehicle card -->
            <div class="detail-card">
              <h3>{{ 'carpool.vehicle' | translate }}</h3>
              <div class="vehicle-info-row">
                <span class="energy-badge-lg" [ngClass]="getEnergyClass(c.vehicleEnergyType)">
                  {{ getEnergyIcon(c.vehicleEnergyType) }} {{ c.vehicleEnergyType }}
                </span>
                <div class="vehicle-details">
                  <span class="vehicle-name">{{ c.vehicleBrand }} {{ c.vehicleModel }}</span>
                  <span class="vehicle-color">{{ c.vehicleColor }}</span>
                  <span class="vehicle-emission">
                    @switch (c.vehicleEnergyType) {
                      @case ('Electric') { {{ 'carpools.zero_emission' | translate }} }
                      @case ('Hybrid') { {{ 'carpools.low_emission' | translate }} }
                      @default { {{ 'carpools.reduced_emission' | translate }} }
                    }
                  </span>
                </div>
              </div>
            </div>

            <!-- Info grid card -->
            <div class="detail-card">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-icon">&#128186;</span>
                  <span class="info-label">{{ 'carpools.seats_info' | translate }}</span>
                  <span class="info-value">{{ c.availableSeats }} / {{ c.totalSeats }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">&#9200;</span>
                  <span class="info-label">{{ 'carpools.estimated_duration' | translate }}</span>
                  <span class="info-value">{{ c.estimatedDurationMinutes ? formatDuration(c.estimatedDurationMinutes) : '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">&#9889;</span>
                  <span class="info-label">{{ 'carpools.energy' | translate }}</span>
                  <span class="info-value">{{ c.vehicleEnergyType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">&#128200;</span>
                  <span class="info-label">{{ 'admin.status_label' | translate }}</span>
                  <span class="info-value status-text" [ngClass]="'status-' + c.status.toLowerCase()">
                    {{ 'carpool.status.' + getStatusKey(c.status) | translate }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (sticky booking) -->
          <div class="detail-right">
            <div class="booking-card">
              <!-- Mini timeline -->
              <div class="booking-route">
                <div class="booking-point">
                  <span class="booking-dot"></span>
                  <span>{{ c.departureCity }}</span>
                  <span class="booking-time">{{ c.departureTime }}</span>
                </div>
                <div class="booking-line"></div>
                <div class="booking-point">
                  <span class="booking-dot arrival"></span>
                  <span>{{ c.arrivalCity }}</span>
                  <span class="booking-time">{{ c.arrivalTime }}</span>
                </div>
              </div>

              <div class="booking-driver">
                <span class="booking-avatar">{{ c.driverUsername.charAt(0).toUpperCase() }}</span>
                <span>{{ c.driverUsername }}</span>
                <span class="booking-rating">&#11088; {{ c.driverAverageRating.toFixed(1) }}</span>
              </div>

              <div class="booking-pricing">
                <div class="booking-price-row">
                  <span>{{ 'carpools.passenger' | translate }}</span>
                  <span>{{ c.pricePerPerson }} {{ 'common.credits' | translate }}</span>
                </div>
                <div class="booking-total">
                  <span>Total</span>
                  <span class="booking-total-amount">{{ c.pricePerPerson }} {{ 'common.credits' | translate }}</span>
                </div>
              </div>

              @if (participationMessage()) {
                <div class="participation-msg" [ngClass]="participationMessageType()">
                  {{ participationMessage() }}
                </div>
              }

              @if (c.status === 'Pending' && c.availableSeats > 0 && authService.isLoggedIn()) {
                <button class="btn-join"
                        [disabled]="participating()"
                        (click)="participate()">
                  @if (participating()) {
                    {{ 'common.loading' | translate }}
                  } @else {
                    {{ 'carpools.join_carpool' | translate }}
                  }
                </button>
                <p class="booking-note">{{ 'carpools.booking_note' | translate }}</p>
              } @else if (!authService.isLoggedIn()) {
                <a routerLink="/login" class="btn-join btn-login-link">{{ 'carpool.login_required' | translate }}</a>
              }

              <!-- Remaining spots -->
              <div class="booking-spots">
                <span class="spots-label">{{ 'carpools.remaining_spots' | translate }}</span>
                <div class="spots-dots">
                  @for (i of seatsArray(c.totalSeats); track i) {
                    <span class="spot-dot" [class.taken]="i >= c.availableSeats"></span>
                  }
                </div>
                <span class="spots-count">{{ c.availableSeats }} / {{ c.totalSeats }}</span>
              </div>
            </div>

            <!-- Balance info -->
            @if (authService.isLoggedIn() && authService.currentUser(); as user) {
              <div class="balance-card">
                <span class="balance-label">{{ 'carpools.your_balance' | translate }}</span>
                <span class="balance-amount">{{ user.credits }} {{ 'common.credits' | translate }}</span>
                <span class="balance-after">{{ user.credits - c.pricePerPerson }} {{ 'common.credits' | translate }} {{ 'carpools.after_booking' | translate }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ===== SEARCH HERO ===== */
    .search-hero {
      background: linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 50%, #58d68d 100%);
      padding: 3rem 2rem 2.5rem;
      text-align: center;
      color: white;
      margin: -20px -20px 0;
    }
    .search-hero h1 {
      color: white;
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 50px;
      padding: 6px;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    .search-field {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 12px;
    }
    .search-icon {
      font-size: 1.1rem;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .search-field input {
      border: none;
      outline: none;
      font-size: 0.95rem;
      padding: 10px 4px;
      width: 100%;
      margin: 0;
      box-shadow: none;
      background: transparent;
      color: var(--black);
    }
    .search-field input:focus {
      box-shadow: none;
      border-color: transparent;
    }
    .search-separator {
      width: 1px;
      height: 30px;
      background: var(--light-gray);
      flex-shrink: 0;
    }
    .btn-search {
      background: var(--dark-green);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s;
    }
    .btn-search:hover {
      background: #1e8449;
    }
    .energy-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.2rem;
      flex-wrap: wrap;
    }
    .legend-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .legend-item {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    /* ===== MAIN CONTENT ===== */
    .main-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      max-width: 1200px;
      margin: 1.5rem auto 0;
      padding: 0 1rem;
    }

    /* ===== SIDEBAR ===== */
    .sidebar { position: relative; }
    .filter-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      position: sticky;
      top: 1rem;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .filter-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    .btn-clear {
      background: none;
      border: none;
      color: var(--primary-green);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0;
    }
    .btn-clear:hover { text-decoration: underline; }
    .filter-section {
      padding: 1rem 0;
      border-top: 1px solid var(--light-gray);
    }
    .filter-section h4 {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: var(--gray);
      font-weight: 600;
    }
    .radio-option, .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .radio-option input, .checkbox-option input {
      width: auto;
      margin: 0;
      accent-color: var(--primary-green);
    }
    .energy-tag {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .electric-tag { background: #e8f4fd; color: #1565c0; }
    .hybrid-tag { background: #e8f5e9; color: #2e7d32; }
    .lpg-tag { background: #fff3e0; color: #e65100; }
    .range-display {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .range-value {
      font-weight: 600;
      color: var(--dark-green);
      font-size: 0.9rem;
    }
    .range-value.muted { color: var(--gray); font-weight: 400; }
    .range-slider {
      width: 100%;
      accent-color: var(--primary-green);
      cursor: pointer;
      padding: 0;
      margin: 0;
      border: none;
      box-shadow: none;
    }
    .range-slider:focus { box-shadow: none; }
    .rating-buttons, .seats-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .rating-btn, .seat-btn {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--light-gray);
      background: white;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .rating-btn.active, .seat-btn.active {
      background: var(--primary-green);
      color: white;
      border-color: var(--primary-green);
    }
    .rating-btn:hover, .seat-btn:hover {
      border-color: var(--primary-green);
    }

    /* ===== RESULTS AREA ===== */
    .results-area {
      min-height: 400px;
    }
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .results-count {
      font-weight: 600;
      color: var(--dark-green);
    }
    .results-summary {
      color: var(--gray);
      font-size: 0.9rem;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      color: var(--primary-green);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--light-gray);
      border-top-color: var(--primary-green);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== RIDE CARDS ===== */
    .ride-card {
      background: white;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
    }
    .ride-card:hover {
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }
    .ride-card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
    }

    /* Route timeline in card */
    .route-timeline {
      display: flex;
      align-items: center;
      gap: 0;
      flex: 1;
    }
    .timeline-point {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-green);
      border: 2px solid var(--dark-green);
      flex-shrink: 0;
      margin-top: 4px;
    }
    .arrival-dot {
      background: var(--danger);
      border-color: #c0392b;
    }
    .timeline-info {
      display: flex;
      flex-direction: column;
    }
    .timeline-time {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--black);
    }
    .timeline-city {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--dark-green);
    }
    .timeline-location {
      font-size: 0.8rem;
      color: var(--gray);
    }
    .timeline-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(to right, var(--primary-green), var(--danger));
      margin: 0 1rem;
      position: relative;
      min-width: 60px;
    }
    .timeline-duration {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: var(--gray);
      white-space: nowrap;
      background: white;
      padding: 0 4px;
    }

    /* Price in card */
    .ride-price {
      text-align: right;
      flex-shrink: 0;
      margin-left: 1rem;
    }
    .price-amount {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary-green);
      display: block;
    }
    .price-unit {
      font-size: 0.8rem;
      color: var(--gray);
    }
    .price-label {
      font-size: 0.75rem;
      color: var(--gray);
      display: block;
    }

    /* Ride footer */
    .ride-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      flex-wrap: wrap;
    }
    .energy-badge {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .energy-electric { background: #e8f4fd; color: #1565c0; }
    .energy-hybrid { background: #e8f5e9; color: #2e7d32; }
    .energy-lpg { background: #fff3e0; color: #e65100; }
    .driver-tag {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--black);
    }
    .driver-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary-green);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .driver-rating {
      color: var(--warning);
      font-size: 0.8rem;
    }
    .vehicle-tag {
      font-size: 0.8rem;
      color: var(--gray);
    }
    .seats-tag {
      font-size: 0.8rem;
      color: var(--gray);
      margin-left: auto;
    }
    .seats-tag.almost-full {
      color: var(--danger);
      font-weight: 600;
    }
    .btn-details {
      padding: 6px 14px;
      border-radius: 20px;
      background: var(--primary-green);
      color: white;
      border: none;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-details:hover {
      background: var(--dark-green);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      color: var(--dark-green);
      margin-bottom: 0.5rem;
    }

    /* ===== DETAIL OVERLAY ===== */
    .detail-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px);
      z-index: 998;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* ===== DETAIL PANEL ===== */
    .detail-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: min(960px, 100%);
      height: 100vh;
      background: #f5f7f5;
      z-index: 999;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      box-shadow: -8px 0 30px rgba(0,0,0,0.15);
    }
    .detail-panel.open {
      transform: translateX(0);
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: white;
      border-bottom: 1px solid var(--light-gray);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .detail-header h2 {
      margin: 0 0 0.25rem;
      font-size: 1.3rem;
    }
    .btn-close-panel {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--light-gray);
      background: white;
      font-size: 1.3rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      color: var(--gray);
      transition: all 0.2s;
    }
    .btn-close-panel:hover {
      background: var(--light-gray);
      color: var(--black);
    }

    .detail-inner {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      padding: 1.5rem 2rem 2rem;
    }
    .detail-left {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .detail-right {
      position: sticky;
      top: 90px;
      align-self: start;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      animation: fadeInUp 0.3s ease both;
    }
    .detail-card h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .detail-card:nth-child(2) { animation-delay: 0.05s; }
    .detail-card:nth-child(3) { animation-delay: 0.1s; }
    .detail-card:nth-child(4) { animation-delay: 0.15s; }

    /* Detail timeline */
    .detail-timeline {
      position: relative;
      padding-left: 20px;
    }
    .dt-point {
      display: flex;
      gap: 0.75rem;
      position: relative;
    }
    .dt-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--primary-green);
      border: 3px solid var(--dark-green);
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    .dt-dot.arrival {
      background: var(--danger);
      border-color: #c0392b;
    }
    .dt-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dt-label {
      font-size: 0.75rem;
      color: var(--gray);
      text-transform: uppercase;
      font-weight: 600;
    }
    .dt-main {
      font-weight: 700;
      font-size: 1rem;
      color: var(--black);
    }
    .dt-sub {
      font-size: 0.85rem;
      color: var(--gray);
    }
    .dt-time {
      font-size: 0.85rem;
      color: var(--dark-green);
      font-weight: 500;
    }
    .dt-line {
      margin: 0.5rem 0 0.5rem 6px;
      padding: 0.5rem 0 0.5rem 1.5rem;
      border-left: 2px dashed var(--light-gray);
    }
    .dt-duration {
      font-size: 0.8rem;
      color: var(--gray);
      background: var(--very-light-green);
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* Driver row in detail */
    .driver-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .driver-avatar-large {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-green), var(--dark-green));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .driver-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .driver-name-lg {
      font-weight: 700;
      font-size: 1.05rem;
    }
    .driver-rating-lg {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .star {
      color: var(--light-gray);
      font-size: 1rem;
    }
    .star.filled {
      color: var(--warning);
    }
    .rating-number {
      margin-left: 4px;
      font-size: 0.85rem;
      color: var(--gray);
    }
    .green-badge {
      font-size: 0.8rem;
      color: var(--dark-green);
      background: var(--very-light-green);
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-block;
      width: fit-content;
    }

    /* Vehicle info in detail */
    .vehicle-info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .energy-badge-lg {
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .vehicle-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .vehicle-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .vehicle-color, .vehicle-emission {
      font-size: 0.85rem;
      color: var(--gray);
    }

    /* Info grid in detail */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0.75rem;
      background: #f8faf8;
      border-radius: 10px;
    }
    .info-icon {
      font-size: 1.3rem;
      margin-bottom: 0.25rem;
    }
    .info-label {
      font-size: 0.75rem;
      color: var(--gray);
      margin-bottom: 0.25rem;
    }
    .info-value {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--black);
    }
    .status-text.status-pending { color: #e65100; }
    .status-text.status-inprogress { color: #1565c0; }
    .status-text.status-completed { color: #2e7d32; }
    .status-text.status-cancelled { color: #c62828; }

    /* ===== BOOKING CARD ===== */
    .booking-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 2px solid var(--primary-green);
    }
    .booking-route {
      margin-bottom: 1rem;
    }
    .booking-point {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .booking-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary-green);
      flex-shrink: 0;
    }
    .booking-dot.arrival {
      background: var(--danger);
    }
    .booking-time {
      margin-left: auto;
      color: var(--gray);
      font-size: 0.85rem;
    }
    .booking-line {
      width: 2px;
      height: 16px;
      background: var(--light-gray);
      margin: 2px 0 2px 4px;
    }
    .booking-driver {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--light-gray);
      border-bottom: 1px solid var(--light-gray);
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .booking-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-green);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .booking-rating {
      margin-left: auto;
      font-size: 0.85rem;
    }
    .booking-pricing {
      margin-bottom: 1rem;
    }
    .booking-price-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--gray);
      padding: 0.25rem 0;
    }
    .booking-total {
      display: flex;
      justify-content: space-between;
      padding-top: 0.5rem;
      border-top: 1px solid var(--light-gray);
      margin-top: 0.5rem;
      font-weight: 700;
    }
    .booking-total-amount {
      color: var(--primary-green);
      font-size: 1.1rem;
    }
    .btn-join {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--primary-green), var(--dark-green));
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      display: block;
      text-decoration: none;
    }
    .btn-join:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(46,204,113,0.4);
    }
    .btn-join:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-login-link {
      background: var(--gray);
      font-size: 0.85rem;
      padding: 10px;
    }
    .booking-note {
      text-align: center;
      font-size: 0.8rem;
      color: var(--gray);
      margin: 0.5rem 0 0;
    }
    .participation-msg {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
      text-align: center;
    }
    .participation-msg.success {
      background: var(--light-green);
      color: var(--dark-green);
    }
    .participation-msg.error {
      background: #fadbd8;
      color: var(--danger);
    }
    .booking-spots {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--light-gray);
    }
    .spots-label {
      font-size: 0.8rem;
      color: var(--gray);
      display: block;
      margin-bottom: 0.4rem;
    }
    .spots-dots {
      display: flex;
      gap: 6px;
      margin-bottom: 0.4rem;
    }
    .spot-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-green);
    }
    .spot-dot.taken {
      background: var(--light-gray);
    }
    .spots-count {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--dark-green);
    }

    /* Balance card */
    .balance-card {
      background: white;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .balance-label {
      font-size: 0.8rem;
      color: var(--gray);
    }
    .balance-amount {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary-green);
    }
    .balance-after {
      font-size: 0.8rem;
      color: var(--gray);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1000px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      .filter-card {
        position: static;
      }
      .detail-panel {
        width: 100%;
      }
      .detail-inner {
        grid-template-columns: 1fr;
        padding: 1rem;
      }
      .detail-right {
        position: static;
      }
      .search-bar {
        flex-direction: column;
        border-radius: 16px;
        padding: 8px;
        gap: 0;
      }
      .search-field {
        padding: 4px 12px;
      }
      .search-separator {
        width: 100%;
        height: 1px;
      }
      .btn-search {
        width: 100%;
        margin-top: 4px;
        border-radius: 12px;
      }
      .ride-card-inner {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      .ride-price {
        text-align: left;
        margin-left: 0;
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }
      .price-label { display: none; }
      .timeline-line { min-width: 40px; }
    }

    @media (max-width: 600px) {
      .search-hero {
        padding: 2rem 1rem 1.5rem;
      }
      .search-hero h1 {
        font-size: 1.3rem;
      }
      .route-timeline {
        flex-direction: column;
        gap: 0;
      }
      .timeline-line {
        width: 2px;
        height: 20px;
        margin: 0.25rem 0 0.25rem 5px;
        min-width: auto;
      }
      .timeline-duration {
        position: static;
        transform: none;
        display: block;
        margin: 0.25rem 0;
      }
      .ride-footer {
        gap: 0.5rem;
      }
      .energy-legend {
        gap: 0.5rem;
      }
    }
  `]
})
export class CarpoolListComponent implements OnInit, OnDestroy {
  // Data
  carpools = signal<Carpool[]>([]);
  loading = signal(false);
  searched = signal(false);

  // Search form
  searchForm: SearchCarpool = {
    departureCity: '',
    arrivalCity: '',
    departureDate: ''
  };

  // Client-side filters
  sortBy = signal<'price' | 'time' | 'duration' | 'rating'>('price');
  energyFilters = signal<Set<string>>(new Set(['Electric', 'Hybrid', 'LPG']));
  minSeats = signal(1);

  // Detail panel
  selectedCarpool = signal<Carpool | null>(null);
  detailPanelOpen = signal(false);
  participating = signal(false);
  participationMessage = signal('');
  participationMessageType = signal('');

  // Filtered + sorted results
  filteredCarpools = computed(() => {
    let results = [...this.carpools()];

    // Filter by energy type
    const energies = this.energyFilters();
    results = results.filter(c => energies.has(c.vehicleEnergyType));

    // Filter by minimum seats
    const seats = this.minSeats();
    results = results.filter(c => c.availableSeats >= seats);

    // Sort
    switch (this.sortBy()) {
      case 'price':
        results.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
        break;
      case 'time':
        results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case 'duration':
        results.sort((a, b) => (a.estimatedDurationMinutes ?? 999) - (b.estimatedDurationMinutes ?? 999));
        break;
      case 'rating':
        results.sort((a, b) => b.driverAverageRating - a.driverAverageRating);
        break;
    }

    return results;
  });

  constructor(
    private carpoolService: CarpoolService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['departureCity'] || params['arrivalCity'] || params['departureDate']) {
        this.searchForm.departureCity = params['departureCity'] || '';
        this.searchForm.arrivalCity = params['arrivalCity'] || '';
        this.searchForm.departureDate = params['departureDate'] || '';
        this.search();
      } else {
        this.loadAll();
      }
    });
  }

  loadAll() {
    this.loading.set(true);
    this.carpoolService.getAll().subscribe({
      next: (results) => {
        this.carpools.set(results);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.searched.set(true);
      }
    });
  }

  search() {
    this.loading.set(true);
    this.searched.set(true);
    this.carpoolService.search(this.searchForm).subscribe({
      next: (results) => {
        this.carpools.set(results);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // Filters
  toggleEnergy(type: string) {
    const current = new Set(this.energyFilters());
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }
    this.energyFilters.set(current);
  }

  onMaxPriceChange(value: number) {
    this.searchForm.maxPrice = value >= 50 ? undefined : value;
  }

  setMinRating(rating: number | undefined) {
    this.searchForm.minimumRating = rating;
  }

  clearFilters() {
    this.sortBy.set('price');
    this.energyFilters.set(new Set(['Electric', 'Hybrid', 'LPG']));
    this.minSeats.set(1);
    this.searchForm.maxPrice = undefined;
    this.searchForm.minimumRating = undefined;
  }

  // Detail panel
  openDetail(carpool: Carpool) {
    this.selectedCarpool.set(carpool);
    this.detailPanelOpen.set(true);
    this.participationMessage.set('');
    document.body.style.overflow = 'hidden';
  }

  closeDetail() {
    this.detailPanelOpen.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.detailPanelOpen()) {
      this.closeDetail();
    }
  }

  participate() {
    const carpool = this.selectedCarpool();
    if (!carpool) return;

    const msg = this.translate.instant('carpool.join_confirm', { price: carpool.pricePerPerson });
    if (!confirm(msg)) return;

    this.participating.set(true);
    this.participationMessage.set('');

    this.carpoolService.participate(carpool.carpoolId).subscribe({
      next: () => {
        this.participating.set(false);
        this.participationMessage.set(this.translate.instant('carpools.request_sent'));
        this.participationMessageType.set('success');
        // Refresh the list
        if (this.searchForm.departureCity || this.searchForm.arrivalCity || this.searchForm.departureDate) {
          this.search();
        } else {
          this.loadAll();
        }
      },
      error: (err) => {
        this.participating.set(false);
        this.participationMessage.set(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.participationMessageType.set('error');
      }
    });
  }

  // Helpers
  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}min` : `${h}h`;
  }

  getEnergyIcon(type: string): string {
    switch (type) {
      case 'Electric': return '\u26A1';
      case 'Hybrid': return '\uD83D\uDD0B';
      case 'LPG': return '\uD83C\uDF3F';
      default: return '\u26A1';
    }
  }

  getStatusKey(status: string): string {
    if (status === 'InProgress') return 'in_progress';
    return status.toLowerCase();
  }

  getEnergyClass(type: string): string {
    switch (type) {
      case 'Electric': return 'energy-electric';
      case 'Hybrid': return 'energy-hybrid';
      case 'LPG': return 'energy-lpg';
      default: return 'energy-electric';
    }
  }

  seatsArray(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i);
  }
}
