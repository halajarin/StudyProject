import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { Carpool } from '../../../models/carpool.model';

@Component({
  selector: 'app-carpool-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading">Loading...</div>
      }

      @if (carpool) {
        <div class="detail-card card">
          <div class="header">
            <h1>{{ carpool.departureCity }} → {{ carpool.arrivalCity }}</h1>
            <span class="badge badge-{{ getStatusClass() }}">{{ carpool.status }}</span>
          </div>

          <div class="trip-info grid grid-2">
            <div>
              <h3>Departure</h3>
              <p><strong>{{ carpool.departureLocation }}</strong></p>
              <p>{{ carpool.departureDate | date:'dd/MM/yyyy' }} at {{ carpool.departureTime }}</p>
            </div>
            <div>
              <h3>Arrival</h3>
              <p><strong>{{ carpool.arrivalLocation }}</strong></p>
              <p>{{ carpool.arrivalDate | date:'dd/MM/yyyy' }} at {{ carpool.arrivalTime }}</p>
            </div>
          </div>

          <div class="driver-section">
            <h3>Driver</h3>
            <div class="driver-card">
              <div>
                <h4>{{ carpool.driverUsername }}</h4>
                <p class="rating">⭐ {{ carpool.driverAverageRating.toFixed(1) }}/5</p>
              </div>
            </div>
          </div>

          <div class="vehicle-section">
            <h3>Vehicle</h3>
            <div class="vehicle-info">
              <p><strong>{{ carpool.vehicleBrand }} {{ carpool.vehicleModel }}</strong></p>
              <p>Color: {{ carpool.vehicleColor }}</p>
              <p>Energy: {{ carpool.vehicleEnergyType }}
                @if (carpool.isEcological) {
                  <span class="badge badge-eco">🔋 Electric</span>
                }
              </p>
            </div>
          </div>

          <div class="details-grid grid grid-2">
            <div class="detail-item">
              <span class="label">Available seats:</span>
              <span class="value">{{ carpool.availableSeats }} / {{ carpool.totalSeats }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Price:</span>
              <span class="value price">{{ carpool.pricePerPerson }} credits</span>
            </div>
            @if (carpool.estimatedDurationMinutes) {
              <div class="detail-item">
                <span class="label">Estimated duration:</span>
                <span class="value">{{ carpool.estimatedDurationMinutes }} minutes</span>
              </div>
            }
          </div>

          @if (authService.isLoggedIn && carpool.availableSeats > 0 && carpool.status === 'En attente') {
            <div class="action-section">
              <button (click)="participate()" class="btn btn-primary" [disabled]="participating">
                {{ participating ? 'Joining...' : 'Join this carpool' }}
              </button>
            </div>
          } @else if (!authService.isLoggedIn) {
            <div class="alert alert-info">
              <p>You must be logged in to join this carpool.</p>
              <a routerLink="/login" class="btn btn-primary">Login</a>
            </div>
          }

          @if (message) {
            <div class="alert" [class]="messageType">{{ message }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-card {
      max-width: 900px;
      margin: 2rem auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--light-gray);
    }

    .trip-info {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: var(--very-light-green);
      border-radius: 10px;
    }

    .driver-section, .vehicle-section {
      margin-bottom: 2rem;
    }

    .driver-card {
      background-color: var(--light-gray);
      padding: 1rem;
      border-radius: 10px;
    }

    .rating {
      color: var(--warning);
      font-size: 1.1rem;
    }

    .vehicle-info {
      background-color: var(--light-gray);
      padding: 1rem;
      border-radius: 10px;
    }

    .details-grid {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--very-light-green);
      border-radius: 10px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .label {
      font-weight: 500;
      color: var(--dark-green);
    }

    .value {
      font-weight: bold;
    }

    .price {
      font-size: 1.3rem;
      color: var(--primary-green);
    }

    .action-section {
      margin-top: 2rem;
      text-align: center;
    }

    .action-section button {
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }

    .badge-success { background-color: var(--primary-green); }
    .badge-warning { background-color: var(--warning); }
    .badge-info { background-color: var(--info); }
  `]
})
export class CarpoolDetailComponent implements OnInit {
  carpool: Carpool | null = null;
  loading = true;
  participating = false;
  message = '';
  messageType = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carpoolService: CarpoolService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCarpool(parseInt(id));
    }
  }

  loadCarpool(id: number) {
    this.carpoolService.getById(id).subscribe({
      next: (data) => {
        this.carpool = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.message = 'Error loading carpool';
        this.messageType = 'alert-danger';
      }
    });
  }

  participate() {
    if (!this.carpool) return;

    if (confirm(`Do you really want to join this carpool for ${this.carpool.pricePerPerson} credits?`)) {
      this.participating = true;

      this.carpoolService.participate(this.carpool.carpoolId).subscribe({
        next: (response) => {
          this.message = 'Participation confirmed! You can see your trips in your profile.';
          this.messageType = 'alert-success';
          this.participating = false;
          this.loadCarpool(this.carpool!.carpoolId);
        },
        error: (err) => {
          this.message = err.error?.message || 'Error joining carpool';
          this.messageType = 'alert-danger';
          this.participating = false;
        }
      });
    }
  }

  getStatusClass() {
    switch(this.carpool?.status) {
      case 'En attente': return 'info';
      case 'En cours': return 'warning';
      case 'Terminé': return 'success';
      default: return 'info';
    }
  }
}
