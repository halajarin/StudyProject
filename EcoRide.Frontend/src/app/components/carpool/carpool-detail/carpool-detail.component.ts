import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { Carpool, CarpoolStatus } from '../../../models/carpool.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carpool-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="loading">{{ 'common.loading' | translate }}</div>
      }

      @if (carpool()) {
        <div class="detail-card card">
          <div class="header">
            <h1>{{ carpool()?.departureCity }} → {{ carpool()?.arrivalCity }}</h1>
            <span class="badge badge-{{ getStatusClass() }}">{{ getStatusLabel() | translate }}</span>
          </div>

          <div class="trip-info grid grid-2">
            <div>
              <h3>{{ 'carpool.departure' | translate }}</h3>
              <p><strong>{{ carpool()?.departureLocation }}</strong></p>
              <p>{{ carpool()?.departureDate | date:'dd/MM/yyyy' }} {{ 'common.at' | translate }} {{ carpool()?.departureTime }}</p>
            </div>
            <div>
              <h3>{{ 'carpool.arrival' | translate }}</h3>
              <p><strong>{{ carpool()?.arrivalLocation }}</strong></p>
              <p>{{ carpool()?.arrivalDate | date:'dd/MM/yyyy' }} {{ 'common.at' | translate }} {{ carpool()?.arrivalTime }}</p>
            </div>
          </div>

          <div class="driver-section">
            <h3>{{ 'carpool.driver' | translate }}</h3>
            <div class="driver-card">
              <div>
                <h4>{{ carpool()?.driverUsername }}</h4>
                <p class="rating">⭐ {{ carpool()?.driverAverageRating?.toFixed(1) }}/5</p>
              </div>
            </div>
          </div>

          <div class="vehicle-section">
            <h3>{{ 'carpool.vehicle' | translate }}</h3>
            <div class="vehicle-info">
              <p><strong>{{ carpool()?.vehicleBrand }} {{ carpool()?.vehicleModel }}</strong></p>
              <p>{{ 'vehicle.color' | translate }}: {{ carpool()?.vehicleColor }}</p>
              <p>{{ 'vehicle.energy_type' | translate }}: {{ carpool()?.vehicleEnergyType }}
                @if (carpool()?.isEcological) {
                  <span class="badge badge-eco">🔋 {{ 'carpool.electric' | translate }}</span>
                }
              </p>
            </div>
          </div>

          <div class="details-grid grid grid-2">
            <div class="detail-item">
              <span class="label">{{ 'carpool.seats_available' | translate }}:</span>
              <span class="value">{{ carpool()?.availableSeats }} / {{ carpool()?.totalSeats }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ 'carpool.price' | translate }}:</span>
              <span class="value price">{{ carpool()?.pricePerPerson }} {{ 'common.credits' | translate }}</span>
            </div>
            @if (carpool()?.estimatedDurationMinutes) {
              <div class="detail-item">
                <span class="label">{{ 'carpool.estimated_duration' | translate }}:</span>
                <span class="value">{{ carpool()?.estimatedDurationMinutes }} {{ 'carpool.minutes' | translate }}</span>
              </div>
            }
          </div>

          @if (authService.isLoggedIn() && carpool()?.userId !== authService.currentUser()?.userId && (carpool()?.availableSeats ?? 0) > 0 && carpool()?.status === CarpoolStatus.Pending) {
            <div class="action-section">
              <button (click)="participate()" class="btn btn-primary" [disabled]="participating()">
                {{ participating() ? ('carpool.creating' | translate) : ('carpool.join' | translate) }}
              </button>
            </div>
          } @else if (!authService.isLoggedIn()) {
            <div class="alert alert-info">
              <p>{{ 'carpool.login_required' | translate }}</p>
              <a routerLink="/login" class="btn btn-primary">{{ 'common.login' | translate }}</a>
            </div>
          }

          @if (message()) {
            <div class="alert" [class]="messageType()">{{ message() }}</div>
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
  // Expose enum to template
  CarpoolStatus = CarpoolStatus;

  // Signal-based state
  carpool = signal<Carpool | null>(null);
  loading = signal(true);
  participating = signal(false);
  message = signal('');
  messageType = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carpoolService: CarpoolService,
    public authService: AuthService,
    private translate: TranslateService
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
        this.carpool.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.message.set(this.translate.instant('messages.error_occurred'));
        this.messageType.set('alert-danger');
      }
    });
  }

  participate() {
    if (!this.carpool()) return;
    const carpoolId = this.carpool()?.carpoolId;
    if (!carpoolId) return;

    const confirmMessage = this.translate.instant('carpool.join_confirm', { price: this.carpool()?.pricePerPerson });
    if (confirm(confirmMessage)) {
      this.participating.set(true);

      this.carpoolService.participate(carpoolId).subscribe({
        next: (response) => {
          this.message.set(this.translate.instant('carpool.joined_successfully'));
          this.messageType.set('alert-success');
          this.participating.set(false);
          this.loadCarpool(this.carpool()!.carpoolId);
        },
        error: (err) => {
          this.message.set(err.error?.message || this.translate.instant('messages.error_occurred'));
          this.messageType.set('alert-danger');
          this.participating.set(false);
        }
      });
    }
  }

  getStatusClass() {
    switch(this.carpool()?.status) {
      case CarpoolStatus.Pending: return 'info';
      case CarpoolStatus.InProgress: return 'warning';
      case CarpoolStatus.Completed: return 'success';
      default: return 'info';
    }
  }

  getStatusLabel() {
    switch(this.carpool()?.status) {
      case CarpoolStatus.Pending: return 'carpool.status.pending';
      case CarpoolStatus.InProgress: return 'carpool.status.in_progress';
      case CarpoolStatus.Completed: return 'carpool.status.completed';
      default: return 'carpool.status.pending';
    }
  }
}
