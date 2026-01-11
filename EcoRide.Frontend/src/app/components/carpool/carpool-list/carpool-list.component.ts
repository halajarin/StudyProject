import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { Carpool, SearchCarpool } from '../../../models/carpool.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carpool-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'carpool.search_title' | translate }}</h1>

      <div class="card search-section">
        <form (ngSubmit)="search()">
          <div class="grid grid-3">
            <div class="form-group">
              <label>{{ 'carpool.departure_city' | translate }}</label>
              <input type="text" [(ngModel)]="searchForm.departureCity" name="departureCity" required>
            </div>
            <div class="form-group">
              <label>{{ 'carpool.arrival_city' | translate }}</label>
              <input type="text" [(ngModel)]="searchForm.arrivalCity" name="arrivalCity" required>
            </div>
            <div class="form-group">
              <label>{{ 'home.date' | translate }}</label>
              <input type="date" [(ngModel)]="searchForm.departureDate" name="departureDate">
            </div>
          </div>

          <div class="filters">
            <h3>{{ 'carpool.filters' | translate }}</h3>
            <div class="grid grid-3">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="searchForm.isEcological" name="isEcological">
                  {{ 'carpool.electric_vehicles_only' | translate }}
                </label>
              </div>
              <div class="form-group">
                <label>{{ 'carpool.maximum_price' | translate }}</label>
                <input type="number" [(ngModel)]="searchForm.maxPrice" name="maxPrice" min="0">
              </div>
              <div class="form-group">
                <label>{{ 'carpool.minimum_rating' | translate }}</label>
                <select [(ngModel)]="searchForm.minimumRating" name="minimumRating">
                  <option [ngValue]="undefined">{{ 'carpool.all' | translate }}</option>
                  <option [ngValue]="3">{{ 'carpool.stars_minimum' | translate:{count: 3} }}</option>
                  <option [ngValue]="4">{{ 'carpool.stars_minimum' | translate:{count: 4} }}</option>
                  <option [ngValue]="5">{{ 'carpool.stars_only' | translate:{count: 5} }}</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
        </form>
      </div>

      @if (loading()) {
        <div class="loading">{{ 'carpool.searching' | translate }}</div>
      }

      @if (carpools().length > 0) {
        <div class="results">
          <h2>{{ 'carpool.trips_found' | translate:{count: carpools().length} }}</h2>

          @for (carpool of carpools(); track carpool.carpoolId) {
            <div class="carpool-card card">
              <div class="card-header">
                <div class="route">
                  <h3>{{ carpool.departureCity }} → {{ carpool.arrivalCity }}</h3>
                  <p class="date">{{ carpool.departureDate | date:'dd/MM/yyyy' }} {{ 'common.at' | translate }} {{ carpool.departureTime }}</p>
                </div>
                <div class="price">
                  <span class="amount">{{ carpool.pricePerPerson }}</span> {{ 'common.credits' | translate }}
                </div>
              </div>

              <div class="card-body">
                <div class="driver-info">
                  <div class="driver-name">
                    <strong>{{ carpool.driverUsername }}</strong>
                    <span class="rating">⭐ {{ carpool.driverAverageRating.toFixed(1) }}</span>
                  </div>
                  <div class="car-info">
                    {{ carpool.vehicleBrand }} {{ carpool.vehicleModel }} - {{ carpool.vehicleColor }}
                    @if (carpool.isEcological) {
                      <span class="badge badge-eco">🔋 {{ 'carpool.electric' | translate }}</span>
                    }
                  </div>
                </div>

                <div class="trip-details">
                  <span>{{ carpool.availableSeats }} {{ (carpool.availableSeats > 1 ? 'carpool.seats_available_plural' : 'carpool.seat_available') | translate }}</span>
                  @if (carpool.estimatedDurationMinutes) {
                    <span>{{ 'carpool.duration' | translate }}: {{ carpool.estimatedDurationMinutes }} {{ 'carpool.min' | translate }}</span>
                  }
                </div>
              </div>

              <div class="card-footer">
                <a [routerLink]="['/carpool', carpool.carpoolId]" class="btn btn-primary">{{ 'carpool.view_details' | translate }}</a>
              </div>
            </div>
          }
        </div>
      } @else if (!loading() && searched()) {
        <div class="alert alert-info">
          <p>{{ 'carpool.no_results' | translate }}</p>
          <p>{{ 'carpool.no_results_action' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-section {
      margin-bottom: 2rem;
    }

    .filters {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--light-gray);
    }

    .results {
      margin-top: 2rem;
    }

    .carpool-card {
      margin-bottom: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--light-gray);
    }

    .route h3 {
      margin: 0;
      color: var(--dark-green);
    }

    .date {
      color: var(--gray);
      margin: 0.5rem 0 0 0;
    }

    .price {
      text-align: right;
    }

    .amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-green);
    }

    .driver-info {
      margin-bottom: 1rem;
    }

    .driver-name {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .rating {
      color: var(--warning);
    }

    .car-info {
      color: var(--gray);
      font-size: 0.9rem;
    }

    .trip-details {
      display: flex;
      gap: 2rem;
      color: var(--gray);
      font-size: 0.9rem;
    }

    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
      text-align: right;
    }
  `]
})
export class CarpoolListComponent implements OnInit {
  searchForm: SearchCarpool = {
    departureCity: '',
    arrivalCity: '',
    departureDate: ''
  };

  carpools = signal<Carpool[]>([]);
  loading = signal(false);
  searched = signal(false);

  constructor(
    private carpoolService: CarpoolService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['departureCity'] && params['arrivalCity']) {
        this.searchForm.departureCity = params['departureCity'];
        this.searchForm.arrivalCity = params['arrivalCity'];
        this.searchForm.departureDate = params['departureDate'] || '';
        this.search();
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
      error: (err) => {
        this.loading.set(false);
      }
    });
  }
}
