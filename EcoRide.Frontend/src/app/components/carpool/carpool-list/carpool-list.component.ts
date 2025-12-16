import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { Carpool, SearchCarpool } from '../../../models/carpool.model';

@Component({
  selector: 'app-carpool-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>Search for a carpool</h1>

      <div class="card search-section">
        <form (ngSubmit)="search()">
          <div class="grid grid-3">
            <div class="form-group">
              <label>Departure city</label>
              <input type="text" [(ngModel)]="searchForm.departureCity" name="departureCity" required>
            </div>
            <div class="form-group">
              <label>Arrival city</label>
              <input type="text" [(ngModel)]="searchForm.arrivalCity" name="arrivalCity" required>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="searchForm.departureDate" name="departureDate" required>
            </div>
          </div>

          <div class="filters">
            <h3>Filters</h3>
            <div class="grid grid-3">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="searchForm.isEcological" name="isEcological">
                  Electric vehicles only
                </label>
              </div>
              <div class="form-group">
                <label>Maximum price (credits)</label>
                <input type="number" [(ngModel)]="searchForm.maxPrice" name="maxPrice" min="0">
              </div>
              <div class="form-group">
                <label>Minimum rating</label>
                <select [(ngModel)]="searchForm.minimumRating" name="minimumRating">
                  <option [ngValue]="undefined">All</option>
                  <option [ngValue]="3">3 stars minimum</option>
                  <option [ngValue]="4">4 stars minimum</option>
                  <option [ngValue]="5">5 stars only</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Search</button>
        </form>
      </div>

      @if (loading) {
        <div class="loading">Searching...</div>
      }

      @if (carpools.length > 0) {
        <div class="results">
          <h2>{{ carpools.length }} trip(s) found</h2>

          @for (carpool of carpools; track carpool.carpoolId) {
            <div class="carpool-card card">
              <div class="card-header">
                <div class="route">
                  <h3>{{ carpool.departureCity }} → {{ carpool.arrivalCity }}</h3>
                  <p class="date">{{ carpool.departureDate | date:'dd/MM/yyyy' }} at {{ carpool.departureTime }}</p>
                </div>
                <div class="price">
                  <span class="amount">{{ carpool.pricePerPerson }}</span> credits
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
                      <span class="badge badge-eco">🔋 Electric</span>
                    }
                  </div>
                </div>

                <div class="trip-details">
                  <span>{{ carpool.availableSeats }} seat(s) available</span>
                  @if (carpool.estimatedDurationMinutes) {
                    <span>Duration: {{ carpool.estimatedDurationMinutes }} min</span>
                  }
                </div>
              </div>

              <div class="card-footer">
                <a [routerLink]="['/carpool', carpool.carpoolId]" class="btn btn-primary">View details</a>
              </div>
            </div>
          }
        </div>
      } @else if (!loading && searched) {
        <div class="alert alert-info">
          <p>No carpools found for these criteria.</p>
          <p>Try modifying your search or choosing another date.</p>
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
    departureDate: new Date()
  };

  carpools: Carpool[] = [];
  loading = false;
  searched = false;

  constructor(
    private carpoolService: CarpoolService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['departureCity']) {
        this.searchForm.departureCity = params['departureCity'];
        this.searchForm.arrivalCity = params['arrivalCity'];
        this.searchForm.departureDate = new Date(params['departureDate']);
        this.search();
      }
    });
  }

  search() {
    this.loading = true;
    this.searched = true;

    this.carpoolService.search(this.searchForm).subscribe({
      next: (results) => {
        this.carpools = results;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
