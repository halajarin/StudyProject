import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CarpoolService } from '../../../services/carpool.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>My Profile</h1>

      @if (user) {
        <div class="grid grid-2">
          <div class="card">
            <h2>My Profile</h2>
            <div class="profile-info">
              <p><strong>Username:</strong> {{ user.username }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Credits:</strong> <span class="credit-amount">{{ user.credits }}</span></p>
              <p><strong>Average rating:</strong> ⭐ {{ user.averageRating.toFixed(1) }} ({{ user.reviewCount }} reviews)</p>
              <p><strong>Roles:</strong> {{ user.roles.join(', ') }}</p>
            </div>

            <div class="role-section">
              <h3>Become a driver</h3>
              @if (!user.roles.includes('Chauffeur')) {
                <button (click)="becomeDriver()" class="btn btn-primary">
                  Add Driver role
                </button>
              } @else {
                <p class="badge badge-success">You are already a driver</p>
              }
            </div>
          </div>

          <div class="card">
            <h2>My Vehicles</h2>
            @if (vehicles.length > 0) {
              @for (vehicle of vehicles; track vehicle.vehicleId) {
                <div class="vehicle-card">
                  <h4>{{ vehicle.brandLabel }} {{ vehicle.model }}</h4>
                  <p>{{ vehicle.registrationNumber }} - {{ vehicle.energyType }}</p>
                  <p>{{ vehicle.seatCount }} seats - {{ vehicle.color }}</p>
                </div>
              }
            } @else {
              <p>No registered vehicles</p>
            }

            @if (user.roles.includes('Chauffeur')) {
              <button (click)="showAddVehicle = !showAddVehicle" class="btn btn-secondary mt-2">
                {{ showAddVehicle ? 'Cancel' : 'Add a vehicle' }}
              </button>

              @if (showAddVehicle) {
                <form (ngSubmit)="addVehicle()" class="mt-2">
                  <div class="form-group">
                    <label>Brand</label>
                    <select [(ngModel)]="newVehicle.brandId" name="brandId" required>
                      <option value="">Select...</option>
                      <option value="1">Renault</option>
                      <option value="2">Peugeot</option>
                      <option value="3">Citroën</option>
                      <option value="4">Tesla</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Model</label>
                    <input type="text" [(ngModel)]="newVehicle.model" name="model" required>
                  </div>
                  <div class="form-group">
                    <label>Registration number</label>
                    <input type="text" [(ngModel)]="newVehicle.registrationNumber" name="registrationNumber" required>
                  </div>
                  <div class="form-group">
                    <label>Energy type</label>
                    <select [(ngModel)]="newVehicle.energyType" name="energyType" required>
                      <option value="Essence">Gas</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electrique">Electric</option>
                      <option value="Hybride">Hybrid</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Color</label>
                    <input type="text" [(ngModel)]="newVehicle.color" name="color" required>
                  </div>
                  <div class="form-group">
                    <label>Number of seats</label>
                    <input type="number" [(ngModel)]="newVehicle.seatCount" name="seatCount" min="1" max="8" required>
                  </div>
                  <button type="submit" class="btn btn-primary">Save</button>
                </form>
              }
            }
          </div>
        </div>

        @if (user.roles.includes('Chauffeur')) {
          <div class="card mt-3">
            <h2>Driver Actions</h2>
            <a routerLink="/create-carpool" class="btn btn-primary">
              ➕ Create a new carpool
            </a>
          </div>
        }

        <div class="card mt-3">
          <h2>My Carpools</h2>
          @if (loading) {
            <p>Loading...</p>
          } @else {
            <div class="trips-section">
              <h3>As driver</h3>
              @if (myTrips.asDriver && myTrips.asDriver.length > 0) {
                @for (trip of myTrips.asDriver; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>
                  </div>
                }
              } @else {
                <p>No trips as driver</p>
              }

              <h3 class="mt-2">As passenger</h3>
              @if (myTrips.asPassenger && myTrips.asPassenger.length > 0) {
                @for (trip of myTrips.asPassenger; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>
                  </div>
                }
              } @else {
                <p>No trips as passenger</p>
              }
            </div>
          }
        </div>
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

    .trip-card {
      background-color: var(--very-light-green);
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 5px;
    }

    .trips-section h3 {
      margin-top: 1.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  vehicles: any[] = [];
  myTrips: any = { asDriver: [], asPassenger: [] };
  loading = true;
  showAddVehicle = false;
  newVehicle: any = {
    brandId: '',
    model: '',
    registrationNumber: '',
    energyType: '',
    color: '',
    seatCount: 4
  };

  constructor(
    private userService: UserService,
    private carpoolService: CarpoolService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
    this.loadMyTrips();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadMyTrips() {
    this.carpoolService.getMyTrips().subscribe({
      next: (data) => {
        this.myTrips = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  becomeDriver() {
    this.userService.addRole(2).subscribe({
      next: () => {
        alert('You are now a driver!');
        this.loadProfile();
      },
      error: (err) => console.error(err)
    });
  }

  addVehicle() {
    this.userService.addVehicle(this.newVehicle).subscribe({
      next: () => {
        alert('Vehicle added successfully');
        this.showAddVehicle = false;
        this.loadVehicles();
      },
      error: (err) => console.error(err)
    });
  }
}
