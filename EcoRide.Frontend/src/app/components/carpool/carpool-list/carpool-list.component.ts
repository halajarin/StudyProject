import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { Carpool, SearchCarpool } from '../../../models/carpool.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { getEnergyIcon as energyIcon } from '../../../utils/energy.utils';

@Component({
  selector: 'app-carpool-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <!-- ===== SEARCH HERO ===== -->
    <div class="search-hero">
      <h1>{{ 'carpools.search_hero_title' | translate }}</h1>
      <div class="search-box">
        <form class="search-form" (ngSubmit)="search()">
          <div class="search-field">
            <div class="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
            </div>
            <input type="text" [(ngModel)]="searchForm.departureCity" name="departureCity"
                   [placeholder]="'carpools.placeholder_departure' | translate">
            <label>{{ 'carpools.label_departure' | translate }}</label>
          </div>

          <div class="search-divider">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>

          <div class="search-field">
            <div class="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
            </div>
            <input type="text" [(ngModel)]="searchForm.arrivalCity" name="arrivalCity"
                   [placeholder]="'carpools.placeholder_arrival' | translate">
            <label>{{ 'carpools.label_arrival' | translate }}</label>
          </div>

          <div class="search-divider hide-mobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>

          <div class="search-field">
            <div class="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <input type="date" [(ngModel)]="searchForm.departureDate" name="departureDate">
            <label>{{ showDateRange ? ('carpools.date_from' | translate) : ('carpools.label_date' | translate) }}</label>
          </div>

          <button type="button" class="date-toggle" (click)="toggleDateRange()">
            {{ showDateRange ? '&times;' : '+' }}
          </button>

          @if (showDateRange) {
            <div class="search-field">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <input type="date" [(ngModel)]="searchForm.departureDateTo" name="departureDateTo">
              <label>{{ 'carpools.date_to' | translate }}</label>
            </div>
          }

          <button type="submit" class="search-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>{{ 'common.search' | translate }}</span>
          </button>
        </form>
      </div>
      <div class="energy-legend">
        <span class="legend-item"><span class="energy-dot elec-dot"></span> {{ 'vehicle.types.electric' | translate }}</span>
        <span class="legend-item"><span class="energy-dot hybrid-dot"></span> {{ 'vehicle.types.hybrid' | translate }}</span>
        <span class="legend-item"><span class="energy-dot lpg-dot"></span> {{ 'vehicle.types.lpg' | translate }}</span>
        <span class="legend-hint">&#8212; {{ 'carpools.energy_legend_label' | translate }}</span>
      </div>
    </div>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="main-content">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="filter-card">
          <div class="filter-card-scroll">
            <div class="filter-header">
              <h3>{{ 'carpools.filters' | translate }}</h3>
              <button class="btn-clear" (click)="clearFilters()">{{ 'carpools.clear_all' | translate }}</button>
            </div>

            <!-- Sort by -->
            <div class="filter-section">
              <h4>{{ 'carpools.sort_by' | translate }}</h4>
              <div class="sort-options">
                <div class="sort-option" [class.active]="sortBy() === 'date'" (click)="sortBy.set('date')">
                  <div class="sort-radio"></div><span>&#128197; {{ 'carpools.sort_newest' | translate }}</span>
                </div>
                <div class="sort-option" [class.active]="sortBy() === 'time'" (click)="sortBy.set('time')">
                  <div class="sort-radio"></div><span>&#9200; {{ 'carpools.sort_earliest' | translate }}</span>
                </div>
                <div class="sort-option" [class.active]="sortBy() === 'price'" (click)="sortBy.set('price')">
                  <div class="sort-radio"></div><span>&#128176; {{ 'carpools.sort_cheapest' | translate }}</span>
                </div>
                <div class="sort-option" [class.active]="sortBy() === 'duration'" (click)="sortBy.set('duration')">
                  <div class="sort-radio"></div><span>&#9889; {{ 'carpools.sort_shortest' | translate }}</span>
                </div>
                <div class="sort-option" [class.active]="sortBy() === 'rating'" (click)="sortBy.set('rating')">
                  <div class="sort-radio"></div><span>&#11088; {{ 'carpools.sort_best_rated' | translate }}</span>
                </div>
              </div>
            </div>

            <!-- Energy type -->
            <div class="filter-section">
              <h4>{{ 'carpools.vehicle_energy' | translate }}</h4>
              <div class="energy-chips">
                <div class="energy-chip" [class.checked]="energyFilters().has('Electric')" (click)="toggleEnergy('Electric')">
                  <div class="chip-check"></div><span class="energy-dot elec-dot"></span><span>{{ 'vehicle.types.electric' | translate }}</span>
                </div>
                <div class="energy-chip" [class.checked]="energyFilters().has('Hybrid')" (click)="toggleEnergy('Hybrid')">
                  <div class="chip-check"></div><span class="energy-dot hybrid-dot"></span><span>{{ 'vehicle.types.hybrid' | translate }}</span>
                </div>
                <div class="energy-chip" [class.checked]="energyFilters().has('LPG')" (click)="toggleEnergy('LPG')">
                  <div class="chip-check"></div><span class="energy-dot lpg-dot"></span><span>{{ 'vehicle.types.lpg' | translate }}</span>
                </div>
              </div>
            </div>

            <!-- Max price -->
            <div class="filter-section">
              <h4>{{ 'carpools.max_price' | translate }}</h4>
              <div class="range-display">
                <span>0 cr</span>
                <strong class="range-value">{{ searchForm.maxPrice || 50 }} {{ 'common.credits' | translate }}</strong>
                <span>50 cr</span>
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
                  3 <span class="note-star">&#9733;</span>
                </button>
                <button class="rating-btn" [class.active]="searchForm.minimumRating === 4" (click)="setMinRating(4)">
                  4 <span class="note-star">&#9733;</span>
                </button>
                <button class="rating-btn" [class.active]="searchForm.minimumRating === 4.5" (click)="setMinRating(4.5)">
                  4.5 <span class="note-star">&#9733;</span>
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

            <!-- Driver preferences -->
            <div class="filter-section">
              <h4>{{ 'carpools.driver_preferences' | translate }}</h4>
              <div class="pref-toggles">
                <div class="pref-toggle" (click)="prefSmoking.set(!prefSmoking())">
                  <span>&#128684; {{ 'carpools.smoking_allowed' | translate }}</span>
                  <div class="pref-mini-switch" [class.on]="prefSmoking()">
                    <div class="pref-mini-switch-knob"></div>
                  </div>
                </div>
                <div class="pref-toggle" (click)="prefPets.set(!prefPets())">
                  <span>&#128062; {{ 'carpools.pets_allowed' | translate }}</span>
                  <div class="pref-mini-switch" [class.on]="prefPets()">
                    <div class="pref-mini-switch-knob"></div>
                  </div>
                </div>
                <div class="pref-toggle" (click)="prefMusic.set(!prefMusic())">
                  <span>&#127925; {{ 'carpools.music_allowed' | translate }}</span>
                  <div class="pref-mini-switch" [class.on]="prefMusic()">
                    <div class="pref-mini-switch-knob"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conversation level -->
            <div class="filter-section">
              <h4>{{ 'carpools.conversation_level' | translate }}</h4>
              <div class="conv-buttons">
                <button class="conv-btn" [class.active]="!prefConversation()" (click)="prefConversation.set(null)">
                  {{ 'carpools.conv_all' | translate }}
                </button>
                <button class="conv-btn" [class.active]="prefConversation() === 'quiet'" (click)="prefConversation.set('quiet')">
                  &#129296; {{ 'carpools.conv_quiet' | translate }}
                </button>
                <button class="conv-btn" [class.active]="prefConversation() === 'moderate'" (click)="prefConversation.set('moderate')">
                  &#128172; {{ 'carpools.conv_moderate' | translate }}
                </button>
                <button class="conv-btn" [class.active]="prefConversation() === 'chatty'" (click)="prefConversation.set('chatty')">
                  &#128483; {{ 'carpools.conv_chatty' | translate }}
                </button>
              </div>
            </div>
          </div>
          <div class="filter-apply-bar">
            <button class="btn-apply" (click)="search()">&#128269; {{ 'carpools.apply_filters' | translate }}</button>
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
              <!-- Date -->
              <div class="ride-date">
                <span class="ride-date-icon">&#128197;</span>
                <span class="ride-date-text">{{ carpool.departureDate | date:'EEEE d MMMM yyyy':undefined:translate.currentLang }}</span>
              </div>

              <div class="ride-card-inner">
                <!-- Route timeline -->
                <div class="route-timeline">
                  <div class="ride-time-block">
                    <div class="ride-time">{{ carpool.departureTime }}</div>
                    <div class="ride-city">{{ carpool.departureCity }}</div>
                  </div>
                  <div class="ride-line">
                    @if (carpool.estimatedDurationMinutes) {
                      <div class="ride-duration">{{ formatDuration(carpool.estimatedDurationMinutes) }}</div>
                    }
                    <div class="ride-line-track"></div>
                    @if (carpool.pausesCount && carpool.pausesCount > 0) {
                      <div class="ride-pause">&#128268; {{ carpool.pausesCount }} pause(s) · ~{{ carpool.pausesDurationMinutes }} min</div>
                    }
                  </div>
                  <div class="ride-time-block">
                    <div class="ride-time">{{ carpool.arrivalTime }}</div>
                    <div class="ride-city">{{ carpool.arrivalCity }}</div>
                  </div>
                </div>

                <!-- Price -->
                <div class="ride-price-block">
                  <div class="ride-price-amount">{{ carpool.pricePerPerson }} <span class="ride-price-unit">{{ 'common.credits' | translate }}</span></div>
                  @if (carpool.availableSeats <= 1) {
                    <span class="ride-status-urgent">&#9888; {{ 'carpools.almost_full' | translate }}</span>
                  }
                </div>
              </div>

              <!-- Preferences labels -->
              @if (carpool.smokingAllowed !== undefined || carpool.petsAllowed !== undefined || carpool.musicAllowed !== undefined || carpool.conversationLevel) {
                <div class="ride-prefs">
                  @if (carpool.smokingAllowed !== undefined) {
                    <span class="pref-label" [class.on]="!carpool.smokingAllowed" [class.off]="carpool.smokingAllowed">
                      {{ carpool.smokingAllowed ? ('carpools.pref_smoker_ok' | translate) : ('carpools.pref_non_smoker' | translate) }}
                    </span>
                  }
                  @if (carpool.petsAllowed !== undefined) {
                    <span class="pref-label" [class.on]="carpool.petsAllowed" [class.off]="!carpool.petsAllowed">
                      {{ carpool.petsAllowed ? ('carpools.pref_pets_ok' | translate) : ('carpools.pref_no_pets' | translate) }}
                    </span>
                  }
                  @if (carpool.musicAllowed !== undefined) {
                    <span class="pref-label" [class.on]="carpool.musicAllowed" [class.off]="!carpool.musicAllowed">
                      {{ carpool.musicAllowed ? ('carpools.pref_music_ok' | translate) : ('carpools.pref_no_music' | translate) }}
                    </span>
                  }
                  @if (carpool.conversationLevel) {
                    <span class="pref-label on">
                      {{ 'carpools.conv_' + carpool.conversationLevel | translate }}
                    </span>
                  }
                </div>
              }

              <!-- Footer -->
              <div class="ride-footer">
                <div class="ride-info">
                  <span class="ride-driver-name">{{ carpool.driverUsername }}</span>
                  <span class="ride-driver-rating">&#9733; {{ carpool.driverAverageRating.toFixed(1) }}</span>
                </div>
                <span class="ride-separator"></span>
                <span class="ride-vehicle">{{ carpool.vehicleBrand }} {{ carpool.vehicleModel }} &#8212; {{ 'vehicle.colors.' + carpool.vehicleColor.toLowerCase() | translate }}</span>
                <span class="energy-badge" [ngClass]="getEnergyClass(carpool.vehicleEnergyType)">
                  {{ getEnergyIcon(carpool.vehicleEnergyType) }} {{ 'vehicle.types.' + carpool.vehicleEnergyType.toLowerCase() | translate }}
                </span>
                <span class="ride-separator"></span>
                <div class="ride-spots">&#129681; <strong>{{ carpool.availableSeats }}</strong> / {{ carpool.totalSeats }}</div>
                <button class="btn-details" (click)="$event.stopPropagation(); openDetail(carpool)">{{ 'carpools.view_details' | translate }}</button>
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
          <button class="btn-back-panel" (click)="closeDetail()">&larr;</button>
          <div>
            <h2>{{ c.departureCity }} &rarr; {{ c.arrivalCity }}</h2>
            <span class="status-badge"
                  [ngClass]="'status-' + c.status.toLowerCase()">
              {{ 'carpool.status.' + getStatusKey(c.status) | translate }}
            </span>
          </div>
        </div>

        <div class="detail-inner">
          <!-- LEFT COLUMN -->
          <div class="detail-left">
            <!-- Itinerary card -->
            <div class="detail-card">
              <div class="card-header">
                <span class="card-title-icon route-icon">&#128205;</span>
                <h3>{{ 'carpools.itinerary_title' | translate }}</h3>
              </div>
              <div class="detail-timeline">
                @if (c.wayBefore) {
                  <div class="dt-point waypoint">
                    <div class="dt-dot waypoint-dot"></div>
                    <div class="dt-info">
                      <span class="dt-main">{{ c.wayBefore }}</span>
                    </div>
                  </div>
                  <div class="dt-line short"></div>
                }
                <div class="dt-point">
                  <div class="dt-dot"></div>
                  <div class="dt-info">
                    <span class="dt-label">{{ 'carpool.departure' | translate }}</span>
                    <span class="dt-main">{{ c.departureCity }}</span>
                    @if (c.departureLocation) {
                      <span class="dt-sub">{{ c.departureLocation }}</span>
                    }
                    <span class="dt-time">{{ c.departureDate | date:'dd/MM/yyyy':undefined:translate.currentLang }} &middot; {{ c.departureTime }}</span>
                  </div>
                </div>
                <div class="dt-line">
                  @if (c.estimatedDurationMinutes) {
                    <span class="dt-duration">{{ 'carpools.travel_time' | translate:{duration: formatDuration(c.estimatedDurationMinutes)} }}</span>
                  }
                  @if (c.pausesCount && c.pausesCount > 0) {
                    <span class="dt-pause-label">&#128268; {{ 'carpools.recharge_stop' | translate }}</span>
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
                @if (c.wayAfter) {
                  <div class="dt-line short"></div>
                  <div class="dt-point waypoint">
                    <div class="dt-dot waypoint-dot"></div>
                    <div class="dt-info">
                      <span class="dt-main">{{ c.wayAfter }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Driver card -->
            <div class="detail-card">
              <div class="card-header">
                <span class="card-title-icon driver-icon">&#128100;</span>
                <h3>{{ 'carpools.driver_title' | translate }}</h3>
              </div>
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
                  <div class="driver-badges">
                    <span class="driver-badge verified">&#9989; {{ 'carpools.verified_driver' | translate }}</span>
                    <span class="driver-badge green">&#127807; {{ 'carpools.green_driver_badge' | translate }}</span>
                  </div>
                </div>
              </div>
              <div class="driver-actions">
                <button class="btn-contact" (click)="contactDriver()">&#9993; {{ 'carpools.contact_driver' | translate }}</button>
                <a routerLink="/reviews" [queryParams]="{ driver: c.driverUsername }" class="btn-contact btn-reviews">&#11088; {{ 'profile.view_reviews' | translate }}</a>
              </div>
            </div>

            <!-- Vehicle card -->
            <div class="detail-card">
              <div class="card-header">
                <span class="card-title-icon vehicle-icon">&#128663;</span>
                <h3>{{ 'carpools.vehicle_title' | translate }}</h3>
              </div>
              <div class="vehicle-info-row">
                <div class="vehicle-energy-badge" [ngClass]="getEnergyClass(c.vehicleEnergyType)">
                  <span class="vehicle-energy-icon">{{ getEnergyIcon(c.vehicleEnergyType) }}</span>
                  <span class="vehicle-energy-label">{{ 'vehicle.types.' + c.vehicleEnergyType.toLowerCase() | translate }}</span>
                </div>
                <div class="vehicle-details">
                  <span class="vehicle-name">{{ c.vehicleBrand }} {{ c.vehicleModel }}</span>
                  <span class="vehicle-color">{{ 'vehicle.colors.' + c.vehicleColor.toLowerCase() | translate }}</span>
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
              <div class="card-header">
                <span class="card-title-icon info-icon-title">&#8505;</span>
                <h3>{{ 'carpools.info_title' | translate }}</h3>
              </div>
              <div class="info-grid-h">
                <div class="info-item-h">
                  <span class="info-icon">&#128197;</span>
                  <span class="info-label">{{ 'carpools.date_info' | translate }}</span>
                  <span class="info-value">{{ c.departureDate | date:'dd/MM/yyyy':undefined:translate.currentLang }}</span>
                </div>
                <div class="info-item-h">
                  <span class="info-icon">&#128186;</span>
                  <span class="info-label">{{ 'carpools.seats_info' | translate }}</span>
                  <span class="info-value">{{ c.availableSeats }} / {{ c.totalSeats }}</span>
                </div>
                <div class="info-item-h">
                  <span class="info-icon">&#9200;</span>
                  <span class="info-label">{{ 'carpools.estimated_duration' | translate }}</span>
                  <span class="info-value">{{ c.estimatedDurationMinutes ? formatDuration(c.estimatedDurationMinutes) : '—' }}</span>
                </div>
                <div class="info-item-h">
                  <span class="info-icon">&#9209;</span>
                  <span class="info-label">{{ 'carpools.pauses_info' | translate }}</span>
                  <span class="info-value">
                    @if (c.pausesCount && c.pausesCount > 0) {
                      {{ 'carpools.pause_label' | translate:{count: c.pausesCount, duration: c.pausesDurationMinutes} }}
                    } @else {
                      {{ 'carpools.no_pauses' | translate }}
                    }
                  </span>
                </div>
                <div class="info-item-h">
                  <span class="info-icon">&#128200;</span>
                  <span class="info-label">{{ 'admin.status_label' | translate }}</span>
                  <span class="info-value status-text" [ngClass]="'status-' + c.status.toLowerCase()">
                    {{ 'carpool.status.' + getStatusKey(c.status) | translate }}
                  </span>
                </div>
                @if (c.smokingAllowed !== undefined || c.petsAllowed !== undefined || c.musicAllowed !== undefined) {
                  <div class="info-item-h">
                    <span class="info-icon">&#9881;</span>
                    <span class="info-label">{{ 'carpools.driver_preferences' | translate }}</span>
                    <span class="info-value info-prefs">
                      @if (c.smokingAllowed !== undefined) {
                        <span class="pref-label mini" [class.on]="!c.smokingAllowed" [class.off]="c.smokingAllowed">
                          {{ c.smokingAllowed ? ('carpools.pref_smoker_ok' | translate) : ('carpools.pref_non_smoker' | translate) }}
                        </span>
                      }
                      @if (c.petsAllowed !== undefined) {
                        <span class="pref-label mini" [class.on]="c.petsAllowed" [class.off]="!c.petsAllowed">
                          {{ c.petsAllowed ? ('carpools.pref_pets_ok' | translate) : ('carpools.pref_no_pets' | translate) }}
                        </span>
                      }
                      @if (c.musicAllowed !== undefined) {
                        <span class="pref-label mini" [class.on]="c.musicAllowed" [class.off]="!c.musicAllowed">
                          {{ c.musicAllowed ? ('carpools.pref_music_ok' | translate) : ('carpools.pref_no_music' | translate) }}
                        </span>
                      }
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (sticky booking) -->
          <div class="detail-right">
            <div class="booking-card">
              <!-- Date header -->
              <div class="booking-date-header">
                &#128197; {{ c.departureDate | date:'EEEE d MMMM yyyy':undefined:translate.currentLang }}
              </div>

              <!-- Mini timeline -->
              <div class="booking-route">
                @if (c.wayBefore) {
                  <div class="booking-point waypoint">
                    <span class="booking-dot waypoint-dot"></span>
                    <span>{{ c.wayBefore }}</span>
                  </div>
                  <div class="booking-line"></div>
                }
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
                @if (c.wayAfter) {
                  <div class="booking-line"></div>
                  <div class="booking-point waypoint">
                    <span class="booking-dot waypoint-dot"></span>
                    <span>{{ c.wayAfter }}</span>
                  </div>
                }
              </div>

              <div class="booking-driver">
                <span class="booking-avatar">{{ c.driverUsername.charAt(0).toUpperCase() }}</span>
                <span>{{ c.driverUsername }}</span>
                <span class="booking-rating">&#11088; {{ c.driverAverageRating.toFixed(1) }}</span>
              </div>

              <!-- Passenger selector -->
              <div class="passenger-selector">
                <span class="passenger-selector-label">{{ 'carpools.passengers_count' | translate }}</span>
                <div class="passenger-selector-controls">
                  <button class="passenger-btn" (click)="decrementPassengers()" [disabled]="passengerCount() <= 1">&minus;</button>
                  <span class="passenger-count-value">{{ passengerCount() }}</span>
                  <button class="passenger-btn" (click)="incrementPassengers()" [disabled]="passengerCount() >= c.availableSeats">&plus;</button>
                </div>
              </div>
              <div class="passenger-dots">
                @for (i of seatsArray(c.availableSeats); track i) {
                  <span class="spot-dot" [class.selected]="i < passengerCount()"></span>
                }
              </div>

              <div class="booking-pricing">
                <div class="booking-price-row">
                  <span>{{ 'carpools.price_per_passenger' | translate }}</span>
                  <span>{{ c.pricePerPerson }} {{ 'common.credits' | translate }}</span>
                </div>
                <div class="booking-price-row">
                  <span>{{ 'carpools.passengers_count' | translate }} &times; {{ passengerCount() }}</span>
                  <span>{{ c.pricePerPerson * passengerCount() }} {{ 'common.credits' | translate }}</span>
                </div>
                <div class="booking-price-row remaining-row">
                  <span>{{ 'carpools.remaining_spots_after' | translate }}</span>
                  <span class="remaining-value">{{ c.availableSeats - passengerCount() }} / {{ c.totalSeats }}</span>
                </div>
                <div class="booking-total">
                  <span>{{ 'common.total' | translate }}</span>
                  <span class="booking-total-amount">{{ c.pricePerPerson * passengerCount() }} {{ 'common.credits' | translate }}</span>
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
      background: linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 100%);
      padding: 2rem 2rem 2.5rem;
      text-align: center;
      color: white;
      margin: -20px -20px 0;
      position: relative;
      overflow: hidden;
    }
    .search-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
      border-radius: 50%;
    }
    .search-hero h1 {
      color: white;
      font-size: 1.5rem;
      margin-bottom: 1.25rem;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }
    .search-box {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08);
      position: relative;
      z-index: 1;
    }
    .search-form {
      display: flex;
      align-items: stretch;
      gap: 0;
    }
    .search-field {
      flex: 1;
      position: relative;
      padding: 8px 16px 6px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }
    .search-field label {
      font-size: 0.7rem;
      color: var(--gray);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1;
      order: -1;
    }
    .search-field input {
      width: 100%;
      border: none;
      outline: none;
      font-size: 0.95rem;
      padding: 2px 0 0;
      background: transparent;
      color: var(--black);
      margin: 0;
      line-height: 1.3;
    }
    .search-field input:focus {
      box-shadow: none;
      border-color: transparent;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--primary-green);
      display: flex;
    }
    .search-divider {
      display: flex;
      align-items: center;
      padding: 0 4px;
      color: var(--light-gray);
    }
    .date-toggle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--light-gray);
      background: white;
      color: var(--primary-green);
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      align-self: center;
      margin: 0 4px;
      transition: all 0.2s ease;
      padding: 0;
      line-height: 1;
    }
    .date-toggle:hover {
      border-color: var(--primary-green);
      background: var(--very-light-green);
    }
    .search-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 28px;
      background: linear-gradient(135deg, var(--primary-green), var(--dark-green));
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.3s ease;
    }
    .search-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
    }
    .energy-legend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 500;
      opacity: 0.85;
    }
    .legend-hint {
      color: rgba(255,255,255,0.6);
      font-size: 0.78rem;
    }
    .energy-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .elec-dot { background: #00B8D4; }
    .hybrid-dot { background: #7CB342; }
    .lpg-dot { background: #FF8F00; }

    /* ===== MAIN CONTENT ===== */
    .main-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 28px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 32px;
      align-items: start;
    }

    /* ===== SIDEBAR ===== */
    .sidebar {
      position: sticky;
      top: 12px;
      max-height: calc(100vh - 24px);
      display: flex;
      flex-direction: column;
    }
    .filter-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(46,204,113,0.08);
      border: 1px solid var(--light-gray);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .filter-card-scroll {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      max-height: calc(100vh - 140px);
    }
    .filter-card-scroll::-webkit-scrollbar { width: 4px; }
    .filter-card-scroll::-webkit-scrollbar-thumb { background: var(--light-gray); border-radius: 2px; }
    .filter-card-scroll::-webkit-scrollbar-thumb:hover { background: var(--primary-green); }
    .filter-apply-bar {
      padding: 14px 20px;
      border-top: 1px solid var(--light-gray);
      background: white;
    }
    .btn-apply {
      width: 100%;
      background: var(--primary-green);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-apply:hover {
      background: var(--dark-green);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46,204,113,0.25);
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .filter-header h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
    }
    .btn-clear {
      background: none;
      border: none;
      color: var(--primary-green);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }
    .btn-clear:hover { text-decoration: underline; }
    .filter-section {
      margin-bottom: 22px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--light-gray);
    }
    .filter-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .filter-section h4 {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--gray);
    }

    /* Sort options */
    .sort-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sort-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.88rem;
    }
    .sort-option:hover { background: var(--very-light-green); }
    .sort-option.active {
      background: #e8f5e9;
      color: var(--dark-green);
      font-weight: 600;
    }
    .sort-radio {
      width: 18px;
      height: 18px;
      border: 2px solid var(--light-gray);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .sort-option.active .sort-radio {
      border-color: var(--primary-green);
    }
    .sort-option.active .sort-radio::after {
      content: '';
      width: 8px;
      height: 8px;
      background: var(--primary-green);
      border-radius: 50%;
    }

    /* Energy chips */
    .energy-chips {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .energy-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.88rem;
    }
    .energy-chip:hover { background: var(--very-light-green); }
    .chip-check {
      width: 18px;
      height: 18px;
      border: 2px solid var(--light-gray);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .energy-chip.checked .chip-check {
      border-color: var(--primary-green);
      background: var(--primary-green);
    }
    .energy-chip.checked .chip-check::after {
      content: '\\2713';
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
    }

    /* Range */
    .range-display {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--gray);
      margin-bottom: 0.5rem;
    }
    .range-value {
      font-weight: 700;
      color: var(--dark-green);
      font-size: 0.85rem;
    }
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

    /* Rating & seats buttons */
    .rating-buttons, .seats-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .rating-btn, .seat-btn {
      padding: 7px 12px;
      border-radius: 8px;
      border: 1.5px solid var(--light-gray);
      background: white;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--gray);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .rating-btn.active, .seat-btn.active {
      border-color: var(--primary-green);
      background: #e8f5e9;
      color: var(--dark-green);
      font-weight: 600;
    }
    .rating-btn:hover, .seat-btn:hover {
      border-color: var(--primary-green);
    }
    .note-star { color: #f39c12; font-size: 0.75rem; }

    /* Preference toggles */
    .pref-toggles {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pref-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.85rem;
    }
    .pref-toggle:hover { background: var(--very-light-green); }
    .pref-mini-switch {
      width: 36px;
      height: 20px;
      border-radius: 10px;
      background: var(--light-gray);
      position: relative;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .pref-mini-switch.on {
      background: var(--primary-green);
    }
    .pref-mini-switch-knob {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: all 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .pref-mini-switch.on .pref-mini-switch-knob {
      left: 18px;
    }

    /* Conversation buttons */
    .conv-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .conv-btn {
      padding: 7px 12px;
      border-radius: 8px;
      border: 1.5px solid var(--light-gray);
      background: white;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--gray);
    }
    .conv-btn.active {
      border-color: var(--primary-green);
      background: #e8f5e9;
      color: var(--dark-green);
      font-weight: 600;
    }
    .conv-btn:hover {
      border-color: var(--primary-green);
    }

    /* ===== RESULTS AREA ===== */
    .results-area {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .results-count {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--dark-green);
    }
    .results-summary {
      color: var(--gray);
      font-size: 0.88rem;
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
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(46,204,113,0.08);
      border: 1px solid #ccc;
      cursor: pointer;
      transition: all 0.25s;
      overflow: hidden;
      animation: fadeInUp 0.4s ease-out both;
    }
    .ride-card:hover {
      box-shadow: 0 6px 24px rgba(46,204,113,0.15);
      transform: translateY(-2px);
      border-color: var(--primary-green);
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Date on card */
    .ride-date {
      font-size: 0.82rem;
      color: var(--gray);
      padding: 12px 24px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .ride-date-icon { font-size: 0.85rem; }
    .ride-date-text {
      background: var(--very-light-green);
      padding: 4px 12px;
      border-radius: 8px;
      color: var(--dark-green);
      font-weight: 600;
      font-size: 0.8rem;
    }

    /* Card inner */
    .ride-card-inner {
      padding: 12px 24px 16px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: center;
    }

    /* Route timeline in card */
    .route-timeline {
      display: flex;
      align-items: center;
    }
    .ride-time-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
    }
    .ride-time {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--black);
    }
    .ride-city {
      font-size: 0.82rem;
      color: var(--gray);
      margin-top: 2px;
    }
    .ride-line {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 12px;
      min-width: 120px;
    }
    .ride-duration {
      font-size: 0.78rem;
      color: var(--gray);
      font-weight: 500;
      margin-bottom: 6px;
    }
    .ride-line-track {
      width: 100%;
      height: 3px;
      background: var(--light-gray);
      border-radius: 2px;
      position: relative;
    }
    .ride-line-track::before,
    .ride-line-track::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 9px;
      height: 9px;
      border-radius: 50%;
      border: 2.5px solid var(--primary-green);
      background: white;
    }
    .ride-line-track::before { left: -5px; }
    .ride-line-track::after { right: -5px; }

    /* Price block */
    .ride-price-block {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .ride-price-amount {
      font-weight: 800;
      font-size: 1.5rem;
      color: var(--dark-green);
    }
    .ride-price-unit {
      font-size: 0.85rem;
      font-weight: 500;
      opacity: 0.7;
    }
    .ride-status-urgent {
      background: #FFF3E0;
      color: #E65100;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Ride footer */
    .ride-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      border-top: 1px solid var(--light-gray);
      background: linear-gradient(135deg, #f0faf6, #e0f2ec);
      flex-wrap: wrap;
    }
    .ride-info {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.82rem;
      color: var(--gray);
    }
    .ride-driver-name {
      font-weight: 600;
      color: var(--black);
    }
    .ride-driver-rating {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #f39c12;
      font-weight: 600;
      font-size: 0.82rem;
    }
    .ride-separator {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--light-gray);
    }
    .ride-vehicle {
      font-size: 0.82rem;
      color: var(--gray);
      font-style: italic;
    }
    .ride-spots {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      color: var(--gray);
    }
    .ride-spots strong { color: var(--dark-green); }
    .energy-badge {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .energy-electric { background: #E0F7FA; color: #00838F; }
    .energy-hybrid { background: #F1F8E9; color: #558B2F; }
    .energy-lpg { background: #FFF8E1; color: #E65100; }
    .btn-details {
      margin-left: auto;
      padding: 8px 20px;
      border-radius: 10px;
      background: var(--primary-green);
      color: white;
      border: none;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .btn-details:hover {
      background: var(--dark-green);
      transform: translateY(-1px);
    }

    /* Ride preferences labels */
    .ride-prefs {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 24px 4px;
      flex-wrap: wrap;
    }
    .pref-label {
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .pref-label.on {
      background: #e8f5e9;
      color: var(--dark-green);
    }
    .pref-label.off {
      background: #f5f5f5;
      color: var(--gray);
    }
    .pref-label.mini {
      padding: 2px 8px;
      font-size: 0.72rem;
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
      align-items: center;
      gap: 1rem;
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
    .btn-back-panel {
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
      flex-shrink: 0;
    }
    .btn-back-panel:hover {
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
      animation: fadeInUpDetail 0.3s ease both;
    }
    .detail-card h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
    }
    @keyframes fadeInUpDetail {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .detail-card:nth-child(2) { animation-delay: 0.05s; }
    .detail-card:nth-child(3) { animation-delay: 0.1s; }
    .detail-card:nth-child(4) { animation-delay: 0.15s; }

    /* Card headers */
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1rem;
    }
    .card-title-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .route-icon { background: #E3F2FD; }
    .driver-icon { background: #FFF3E0; }
    .vehicle-icon { background: #E8F5E9; }
    .info-icon-title { background: #F3E5F5; }

    /* Driver badges */
    .driver-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 2px;
    }
    .driver-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .driver-badge.verified {
      background: #E3F2FD;
      color: #1565C0;
    }
    .driver-badge.green {
      background: var(--very-light-green);
      color: var(--dark-green);
    }
    .driver-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .btn-contact {
      flex: 1;
      padding: 8px;
      border: 1.5px solid var(--primary-green);
      background: white;
      color: var(--primary-green);
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      text-decoration: none;
    }
    .btn-contact:hover {
      background: var(--very-light-green);
    }

    /* Vehicle energy badge (square) */
    .vehicle-energy-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .vehicle-energy-icon {
      font-size: 1.2rem;
    }
    .vehicle-energy-label {
      font-size: 0.65rem;
      font-weight: 700;
      margin-top: 2px;
    }

    /* Info grid horizontal */
    .info-grid-h {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .info-item-h {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-item-h:last-child {
      border-bottom: none;
    }
    .info-item-h .info-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }
    .info-item-h .info-label {
      font-size: 0.82rem;
      color: var(--gray);
      flex: 1;
      margin: 0;
    }
    .info-item-h .info-value {
      font-weight: 600;
      font-size: 0.88rem;
      color: var(--black);
      text-align: right;
    }
    .info-prefs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

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
    .booking-date-header {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--dark-green);
      background: var(--very-light-green);
      padding: 6px 12px;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      text-align: center;
    }
    .passenger-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--light-gray);
      margin-bottom: 0.75rem;
    }
    .passenger-selector-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--gray);
    }
    .passenger-selector-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .passenger-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--light-gray);
      background: white;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      color: var(--dark-green);
      padding: 0;
    }
    .passenger-btn:hover:not(:disabled) {
      border-color: var(--primary-green);
      background: var(--very-light-green);
    }
    .passenger-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .passenger-count-value {
      font-weight: 700;
      font-size: 1rem;
      min-width: 20px;
      text-align: center;
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

    /* ===== RIDE PAUSE LABEL ===== */
    .ride-pause {
      font-size: 0.75rem;
      color: #E65100;
      font-weight: 500;
      margin-top: 6px;
    }

    /* ===== WAYPOINT STYLES ===== */
    .dt-point.waypoint {
      opacity: 0.5;
    }
    .dt-dot.waypoint-dot {
      width: 10px;
      height: 10px;
      background: var(--gray);
      border: 2px solid var(--gray);
    }
    .dt-line.short {
      margin: 0.25rem 0 0.25rem 6px;
      padding: 0.25rem 0 0.25rem 1.5rem;
      border-left: 2px dashed var(--light-gray);
    }
    .dt-pause-label {
      display: inline-block;
      background: #FFF3E0;
      color: #E65100;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
      margin-top: 4px;
    }

    /* Booking waypoints */
    .booking-point.waypoint {
      opacity: 0.5;
    }
    .booking-dot.waypoint-dot {
      width: 8px;
      height: 8px;
      background: var(--gray);
    }

    /* Passenger dots */
    .passenger-dots {
      display: flex;
      gap: 6px;
      padding: 0 0 0.75rem;
      justify-content: center;
    }
    .spot-dot.selected {
      background: #FF9800;
      box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3);
    }

    /* Remaining row */
    .remaining-row {
      font-style: italic;
    }
    .remaining-value {
      font-weight: 600;
      color: var(--dark-green);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1000px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      .sidebar {
        position: static;
        max-height: none;
      }
      .filter-card-scroll {
        max-height: none;
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
      .search-form {
        flex-direction: column;
        gap: 0;
      }
      .search-field {
        border-bottom: 1px solid var(--light-gray);
        padding: 10px 16px 8px 48px;
      }
      .search-field:last-of-type {
        border-bottom: none;
      }
      .search-divider {
        display: none;
      }
      .hide-mobile {
        display: none;
      }
      .date-toggle {
        align-self: flex-start;
        margin: 4px 16px;
      }
      .search-btn {
        margin: 8px;
        justify-content: center;
        border-radius: 12px;
      }
      .ride-card-inner {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      .ride-price-block {
        text-align: left;
        align-items: flex-start;
        flex-direction: row;
        gap: 0.75rem;
      }
      .ride-line {
        min-width: 80px;
      }
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
        align-items: flex-start;
        gap: 0;
      }
      .ride-line {
        width: 2px;
        height: 20px;
        min-width: auto;
        padding: 0;
        margin-left: 20px;
      }
      .ride-line-track {
        width: 2px;
        height: 100%;
      }
      .ride-duration {
        display: none;
      }
      .ride-footer {
        gap: 0.5rem;
      }
      .energy-legend {
        gap: 0.5rem;
      }
      .main-content {
        padding: 16px;
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
  showDateRange = false;
  searchForm: SearchCarpool = {
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    departureDateTo: ''
  };

  // Client-side filters
  sortBy = signal<'date' | 'price' | 'time' | 'duration' | 'rating'>('date');
  energyFilters = signal<Set<string>>(new Set(['Electric', 'Hybrid', 'LPG']));
  minSeats = signal(1);
  prefSmoking = signal(false);
  prefPets = signal(false);
  prefMusic = signal(false);
  prefConversation = signal<string | null>(null);

  // Detail panel
  selectedCarpool = signal<Carpool | null>(null);
  detailPanelOpen = signal(false);
  participating = signal(false);
  participationMessage = signal('');
  participationMessageType = signal('');
  passengerCount = signal(1);

  // Filtered + sorted results
  filteredCarpools = computed(() => {
    let results = [...this.carpools()];

    // Filter by energy type
    const energies = this.energyFilters();
    results = results.filter(c => energies.has(c.vehicleEnergyType));

    // Filter by minimum seats
    const seats = this.minSeats();
    results = results.filter(c => c.availableSeats >= seats);

    // Filter by driver preferences
    if (this.prefSmoking()) {
      results = results.filter(c => c.smokingAllowed === true);
    }
    if (this.prefPets()) {
      results = results.filter(c => c.petsAllowed === true);
    }
    if (this.prefMusic()) {
      results = results.filter(c => c.musicAllowed === true);
    }
    const conv = this.prefConversation();
    if (conv) {
      results = results.filter(c => c.conversationLevel === conv);
    }

    // Sort
    switch (this.sortBy()) {
      case 'date':
        results.sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
        break;
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
    public translate: TranslateService,
    private errorHandler: ErrorHandlerService
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
        this.searchForm.departureDateTo = params['departureDateTo'] || '';
        if (this.searchForm.departureDateTo) {
          this.showDateRange = true;
        }
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
    this.sortBy.set('date');
    this.energyFilters.set(new Set(['Electric', 'Hybrid', 'LPG']));
    this.minSeats.set(1);
    this.prefSmoking.set(false);
    this.prefPets.set(false);
    this.prefMusic.set(false);
    this.prefConversation.set(null);
    this.searchForm.maxPrice = undefined;
    this.searchForm.minimumRating = undefined;
  }

  toggleDateRange() {
    this.showDateRange = !this.showDateRange;
    if (!this.showDateRange) {
      this.searchForm.departureDateTo = '';
    }
  }

  // Detail panel
  openDetail(carpool: Carpool) {
    this.selectedCarpool.set(carpool);
    this.detailPanelOpen.set(true);
    this.participationMessage.set('');
    this.passengerCount.set(1);
    document.body.style.overflow = 'hidden';
  }

  closeDetail() {
    this.detailPanelOpen.set(false);
    document.body.style.overflow = '';
  }

  contactDriver() {
    const c = this.selectedCarpool();
    if (c?.driverEmail) {
      const subject = `EcoRide: ${c.departureCity} → ${c.arrivalCity}`;
      window.location.href = `mailto:${c.driverEmail}?subject=${encodeURIComponent(subject)}`;
    }
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

    const totalPrice = carpool.pricePerPerson * this.passengerCount();
    const msg = this.translate.instant('carpool.join_confirm', { price: totalPrice });
    if (!confirm(msg)) return;

    this.participating.set(true);
    this.participationMessage.set('');

    this.carpoolService.participate(carpool.carpoolId, this.passengerCount()).subscribe({
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
        this.participationMessage.set(this.errorHandler.handleError(err));
        this.participationMessageType.set('error');
      }
    });
  }

  // Passenger count
  incrementPassengers() {
    const carpool = this.selectedCarpool();
    if (carpool && this.passengerCount() < carpool.availableSeats) {
      this.passengerCount.set(this.passengerCount() + 1);
    }
  }

  decrementPassengers() {
    if (this.passengerCount() > 1) {
      this.passengerCount.set(this.passengerCount() - 1);
    }
  }

  // Helpers
  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}min` : `${h}h`;
  }

  getEnergyIcon = energyIcon;

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
