import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { UserService } from '../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-carpool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Create a carpool</h1>

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      <div class="card">
        <form (ngSubmit)="createTrip()">
          <div class="grid grid-2">
            <div class="form-group">
              <label>Departure city *</label>
              <input type="text" [(ngModel)]="trip.departureCity" name="departureCity" required>
            </div>

            <div class="form-group">
              <label>Departure location *</label>
              <input type="text" [(ngModel)]="trip.departureLocation" name="departureLocation"
                     placeholder="Ex: Montparnasse Station" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Arrival city *</label>
              <input type="text" [(ngModel)]="trip.arrivalCity" name="arrivalCity" required>
            </div>

            <div class="form-group">
              <label>Arrival location *</label>
              <input type="text" [(ngModel)]="trip.arrivalLocation" name="arrivalLocation"
                     placeholder="Ex: Lyon Station" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Departure date *</label>
              <input type="date" [(ngModel)]="trip.departureDate" name="departureDate" required>
            </div>

            <div class="form-group">
              <label>Departure time *</label>
              <input type="time" [(ngModel)]="trip.departureTime" name="departureTime" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Arrival date *</label>
              <input type="date" [(ngModel)]="trip.arrivalDate" name="arrivalDate" required>
            </div>

            <div class="form-group">
              <label>Arrival time *</label>
              <input type="time" [(ngModel)]="trip.arrivalTime" name="arrivalTime" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Number of seats *</label>
              <input type="number" [(ngModel)]="trip.totalSeats" name="totalSeats" min="1" max="8" required>
            </div>

            <div class="form-group">
              <label>Price per person (credits) *</label>
              <input type="number" [(ngModel)]="trip.pricePerPerson" name="pricePerPerson"
                     min="2" required>
              <small>Minimum 2 credits (platform commission)</small>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Vehicle *</label>
              <select [(ngModel)]="trip.vehicleId" name="vehicleId" required>
                <option value="">Select a vehicle</option>
                @for (vehicle of vehicles; track vehicle.vehicleId) {
                  <option [value]="vehicle.vehicleId">
                    {{ vehicle.brandLabel }} {{ vehicle.model }} ({{ vehicle.registrationNumber }})
                  </option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Estimated duration (minutes)</label>
              <input type="number" [(ngModel)]="trip.estimatedDurationMinutes" name="estimatedDurationMinutes" min="1">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create carpool' }}
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
  trip: any = {
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
    vehicleId: '',
    estimatedDurationMinutes: null
  };

  vehicles: any[] = [];
  error = '';
  success = '';
  loading = false;

  constructor(
    private carpoolService: CarpoolService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        if (this.vehicles.length === 0) {
          this.error = 'You must first add a vehicle in your profile.';
        }
      },
      error: (err) => console.error(err)
    });
  }

  createTrip() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.carpoolService.create(this.trip).subscribe({
      next: () => {
        this.success = 'Carpool created successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error creating carpool';
        this.loading = false;
      }
    });
  }
}
