import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CarpoolService } from '../../../services/carpool.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { UserRole, RoleId } from '../../../models/role.enum';
import { Vehicle } from '../../../models/vehicle.model';
import { Carpool } from '../../../models/carpool.model';
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
              <button (click)="showAddVehicle.set(!showAddVehicle())" class="btn btn-secondary mt-2">
                {{ showAddVehicle() ? ('common.cancel' | translate) : ('user.add_vehicle' | translate) }}
              </button>

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

        @if (hasRole(UserRole.Driver)) {
          <div class="card mt-3">
            <h2>{{ 'carpool.driver' | translate }}</h2>
            <a routerLink="/create-carpool" class="btn btn-primary">
              ➕ {{ 'navigation.create_carpool' | translate }}
            </a>
          </div>
        }

        <div class="card mt-3">
          <h2>{{ 'navigation.my_trips' | translate }}</h2>
          @if (loading()) {
            <p>{{ 'common.loading' | translate }}</p>
          } @else {
            <div class="trips-section">
              <h3>{{ 'carpool.driver' | translate }}</h3>
              @if (myTrips().asDriver && myTrips().asDriver.length > 0) {
                @for (trip of myTrips().asDriver; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>
                  </div>
                }
              } @else {
                <p>{{ 'carpool.no_trips_driver' | translate }}</p>
              }

              <h3 class="mt-2">{{ 'carpool.passengers' | translate }}</h3>
              @if (myTrips().asPassenger && myTrips().asPassenger.length > 0) {
                @for (trip of myTrips().asPassenger; track trip.carpoolId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.departureCity }} → {{ trip.arrivalCity }}</strong></p>
                    <p>{{ trip.departureDate | date:'dd/MM/yyyy' }} - {{ trip.status }}</p>
                  </div>
                }
              } @else {
                <p>{{ 'carpool.no_trips_passenger' | translate }}</p>
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
  // Expose enum to template
  UserRole = UserRole;

  // Signal-based state
  user = signal<User | null>(null);
  vehicles = signal<Vehicle[]>([]);
  myTrips = signal<{ asDriver: Carpool[], asPassenger: Carpool[] }>({ asDriver: [], asPassenger: [] });
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

  constructor(
    private userService: UserService,
    private carpoolService: CarpoolService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
    this.loadMyTrips();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        // Update localStorage to keep auth service in sync
        localStorage.setItem('currentUser', JSON.stringify(data));
        // Refresh auth service signal
        this.authService.refreshCurrentUser();
      },
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
      },
    });
  }

  loadMyTrips() {
    this.carpoolService.getMyTrips().subscribe({
      next: (data) => {
        this.myTrips.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
      }
    });
  }

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  becomeDriver() {
    this.userService.addRole(RoleId.Driver).subscribe({
      next: (response: any) => {
        // Update token if returned
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
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
}
