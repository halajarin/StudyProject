import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { UserRole, RoleId } from '../../../models/role.enum';
import { Vehicle } from '../../../models/vehicle.model';
import { CreateVehicleForm } from '../../../interfaces/vehicle.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
              <p><strong>{{ 'carpool.rating' | translate }}:</strong> {{ user()?.averageRating?.toFixed(1) }} ({{ user()?.reviewCount }} {{ 'review.reviews' | translate }})</p>
              <p><strong>{{ 'user.roles' | translate }}:</strong> {{ user()?.roles?.join(', ') }}</p>
            </div>

            <div class="credits-section">
              <h3>{{ 'user.add_credits' | translate }}</h3>
              <div class="credits-options">
                @for (option of creditOptions; track option) {
                  <button (click)="addCredits(option)"
                          class="btn btn-credit"
                          [disabled]="addingCredits()">
                    +{{ option }} {{ 'common.credits' | translate }}
                  </button>
                }
              </div>
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

    .credits-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
    }

    .credits-options {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn-credit {
      background-color: var(--primary-green);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .btn-credit:hover:not(:disabled) {
      background-color: var(--dark-green);
    }

    .btn-credit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .badge-success {
      background-color: #28a745;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
    }
  `]
})
export class ProfileComponent implements OnInit {
  UserRole = UserRole;

  user = signal<User | null>(null);
  vehicles = signal<Vehicle[]>([]);
  showAddVehicle = signal(false);
  newVehicle: CreateVehicleForm = {
    brandId: 0,
    model: '',
    registrationNumber: '',
    energyType: '',
    color: '',
    seatCount: 4
  };

  // Credits
  creditOptions = [10, 20, 50];
  addingCredits = signal(false);

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
        this.authService.refreshCurrentUser();
      },
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => this.vehicles.set(data),
    });
  }

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  becomeDriver() {
    this.userService.addRole(RoleId.Driver).subscribe({
      next: (response: any) => {
        if (response.token) localStorage.setItem('token', response.token);
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

  addCredits(amount: number) {
    this.addingCredits.set(true);
    this.userService.addCredits(amount).subscribe({
      next: () => {
        alert(this.translate.instant('user.credits_added_success', { count: amount }));
        this.addingCredits.set(false);
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.addingCredits.set(false);
      }
    });
  }
}
