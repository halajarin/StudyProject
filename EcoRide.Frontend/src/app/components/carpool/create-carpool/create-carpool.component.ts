import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { UserService } from '../../../services/user.service';
import { Vehicle } from '../../../models/vehicle.model';
import { CreateCarpoolForm } from '../../../interfaces/carpool-form.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-carpool',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'carpool.create_title' | translate }}</h1>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      @if (success()) {
        <div class="alert alert-success">{{ success() }}</div>
      }

      <div class="card">
        <form (ngSubmit)="createTrip()">
          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.departure_city' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="text" [(ngModel)]="trip.departureCity" name="departureCity" required>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.departure_location' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="text" [(ngModel)]="trip.departureLocation" name="departureLocation"
                     [placeholder]="'carpool.placeholder_departure_location' | translate" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.arrival_city' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="text" [(ngModel)]="trip.arrivalCity" name="arrivalCity" required>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.arrival_location' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="text" [(ngModel)]="trip.arrivalLocation" name="arrivalLocation"
                     [placeholder]="'carpool.placeholder_arrival_location' | translate" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.departure_date' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="date" [(ngModel)]="trip.departureDate" name="departureDate"
                     (ngModelChange)="calculateDuration()" required>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.departure_time' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="time" [(ngModel)]="trip.departureTime" name="departureTime"
                     (ngModelChange)="calculateDuration()" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.arrival_date' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="date" [(ngModel)]="trip.arrivalDate" name="arrivalDate"
                     (ngModelChange)="calculateDuration()" required>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.arrival_time' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="time" [(ngModel)]="trip.arrivalTime" name="arrivalTime"
                     (ngModelChange)="calculateDuration()" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.number_of_seats' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input type="number" [(ngModel)]="trip.totalSeats" name="totalSeats" min="1" max="8" required>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.price_per_person' | translate }} ({{ 'common.credits' | translate }}) {{ 'auth.required_field_marker' | translate }}</label>
              <input type="number" [(ngModel)]="trip.pricePerPerson" name="pricePerPerson"
                     min="2" required>
              <small>{{ 'carpool.platform_commission' | translate }}</small>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>{{ 'carpool.vehicle' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <select [(ngModel)]="trip.vehicleId" name="vehicleId" required>
                <option value="">{{ 'carpool.select_vehicle' | translate }}</option>
                @for (vehicle of vehicles(); track vehicle.vehicleId) {
                  <option [value]="vehicle.vehicleId">
                    {{ vehicle.brandLabel }} {{ vehicle.model }} ({{ vehicle.registrationNumber }})
                  </option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>{{ 'carpool.estimated_duration' | translate }} ({{ 'carpool.minutes' | translate }})</label>
              <input type="number" [(ngModel)]="trip.estimatedDurationMinutes" name="estimatedDurationMinutes" min="1" readonly>
              <small>{{ 'carpool.duration_auto_calculated' | translate }}</small>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading()">
            {{ loading() ? ('carpool.creating' | translate) : ('common.add' | translate) }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 2rem auto;
    }

    small {
      display: block;
      color: var(--gray);
      margin-top: 0.3rem;
    }
  `]
})
export class CreateCarpoolComponent implements OnInit {
  trip: CreateCarpoolForm = {
    departureCity: '',
    departureLocation: '',
    arrivalCity: '',
    arrivalLocation: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    totalSeats: 3,
    pricePerPerson: 20,
    vehicleId: 0,
    estimatedDurationMinutes: undefined
  };

  vehicles = signal<Vehicle[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);

  constructor(
    private carpoolService: CarpoolService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        if (this.vehicles().length === 0) {
          this.error.set(this.translate.instant('carpool.must_add_vehicle'));
        }
      },
    });
  }

  calculateDuration() {
    // Only calculate if all date/time fields are filled
    if (!this.trip.departureDate || !this.trip.departureTime ||
      !this.trip.arrivalDate || !this.trip.arrivalTime) {
      return;
    }

    // Combine date and time into full DateTime objects
    const departureDateTime = new Date(`${this.trip.departureDate}T${this.trip.departureTime}`);
    const arrivalDateTime = new Date(`${this.trip.arrivalDate}T${this.trip.arrivalTime}`);

    // Calculate difference in milliseconds, then convert to minutes
    const diffMs = arrivalDateTime.getTime() - departureDateTime.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    // Only set if the duration is positive
    if (diffMinutes > 0) {
      this.trip.estimatedDurationMinutes = diffMinutes;
    } else {
      this.trip.estimatedDurationMinutes = undefined;
    }
  }

  createTrip() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    // Convert form data to CreateCarpool format
    const carpoolData = {
      ...this.trip,
      departureDate: new Date(this.trip.departureDate),
      arrivalDate: new Date(this.trip.arrivalDate)
    };

    this.carpoolService.create(carpoolData).subscribe({
      next: () => {
        this.success.set(this.translate.instant('carpool.created_successfully'));
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.loading.set(false);
      }
    });
  }
}
