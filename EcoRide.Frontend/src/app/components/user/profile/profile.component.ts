import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { UserRole, RoleId } from '../../../models/role.enum';
import { Vehicle, CreateVehicle } from '../../../models/vehicle.model';
import { UserPreferences } from '../../../interfaces/user-preferences.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getEnergyIcon as energyIcon } from '../../../utils/energy.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <!-- ========== PROFILE HERO ========== -->
    <div class="profile-hero">
      <div class="hero-content">
        <div class="hero-avatar">{{ getUserInitial() }}</div>
        <div class="hero-info">
          <h1>{{ user()?.username }}</h1>
          <p class="hero-email">{{ user()?.email }}</p>
          <div class="hero-badges">
            @for (role of user()?.roles ?? []; track role) {
              <span class="hero-badge">{{ 'admin.roles.' + role | translate }}</span>
            }
          </div>
        </div>
        <button class="btn-hero-edit" (click)="openEditProfileModal()">
          {{ 'profile.edit_profile' | translate }}
        </button>
      </div>
    </div>

    @if (user()) {
      <!-- ========== CARDS GRID ========== -->
      <div class="container">
        <div class="profile-grid">

          <!-- Card: Personal Info -->
          <div class="profile-card card-animate">
            <div class="card-header-icon">
              <span class="card-icon">&#128100;</span>
              <h2>{{ 'profile.personal_info' | translate }}</h2>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">{{ 'auth.username' | translate }}</span>
                <span class="info-value">{{ user()?.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ 'auth.email' | translate }}</span>
                <span class="info-value">{{ user()?.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ 'user.credits' | translate }}</span>
                <span class="info-value credit-green">{{ user()?.credits }} {{ 'common.credits' | translate }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ 'carpool.rating' | translate }}</span>
                <span class="info-value">
                  <span class="stars">{{ getStars(user()?.averageRating ?? 0) }}</span>
                  <span class="review-count">({{ user()?.reviewCount ?? 0 }})</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">{{ 'user.roles' | translate }}</span>
                <span class="info-value">{{ user()?.roles?.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- Card: Credits -->
          <div class="profile-card card-animate">
            <div class="card-header-icon">
              <span class="card-icon">&#128176;</span>
              <h2>{{ 'profile.credits_balance' | translate }}</h2>
            </div>
            <div class="card-body credits-card-body">
              <div class="credits-display">
                <span class="credits-big">{{ user()?.credits }}</span>
                <span class="credits-label">{{ 'profile.available_credits' | translate }}</span>
              </div>
              <div class="credits-actions">
                <p class="credits-subtitle">{{ 'profile.recharge_credits' | translate }}</p>
                <div class="credits-buttons">
                  @for (option of creditOptions; track option) {
                    <button (click)="addCredits(option)"
                            class="btn-credit"
                            [disabled]="addingCredits()">
                      +{{ option }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Driver Status -->
          <div class="profile-card card-animate">
            <div class="card-header-icon">
              <span class="card-icon">&#128663;</span>
              <h2>{{ 'profile.driver_status' | translate }}</h2>
            </div>
            <div class="card-body driver-card-body">
              @if (hasRole(UserRole.Driver)) {
                <div class="driver-status-badge active">
                  <span class="status-dot"></span>
                  {{ 'profile.driver_active' | translate }}
                </div>
              } @else {
                <div class="driver-status-badge inactive">
                  <span class="status-dot"></span>
                  {{ 'profile.driver_inactive' | translate }}
                </div>
                <button class="btn btn-primary mt-2" (click)="openDriverModal()">
                  {{ 'profile.become_driver' | translate }}
                </button>
              }
            </div>
          </div>

          <!-- Card: Vehicles -->
          <div class="profile-card card-animate">
            <div class="card-header-icon">
              <span class="card-icon">&#128664;</span>
              <h2>{{ 'user.my_vehicles' | translate }}</h2>
            </div>
            <div class="card-body">
              @if (vehicles().length > 0) {
                @for (vehicle of vehicles(); track vehicle.vehicleId) {
                  <div class="vehicle-item">
                    <div class="vehicle-item-left">
                      <span class="energy-badge" [class]="getEnergyBadgeClass(vehicle.energyType)">
                        {{ getEnergyIcon(vehicle.energyType) }} {{ getEnergyShortLabel(vehicle.energyType) }}
                      </span>
                      <div class="vehicle-item-info">
                        <strong>{{ vehicle.brandLabel }} {{ vehicle.model }}</strong>
                        <span class="vehicle-meta">{{ vehicle.registrationNumber }} &middot; {{ vehicle.color }} &middot; {{ vehicle.seatCount }} {{ 'profile.seats_passenger' | translate }}</span>
                      </div>
                    </div>
                    <div class="vehicle-item-actions">
                      @if (hasRole(UserRole.Driver)) {
                        <button class="btn-icon" (click)="openEditVehicleModal(vehicle)" title="Edit">&#9998;</button>
                        <button class="btn-icon btn-icon-danger" (click)="deleteVehicle(vehicle.vehicleId)" [disabled]="deletingVehicleId() === vehicle.vehicleId" title="Delete">&#128465;</button>
                      }
                    </div>
                  </div>
                }
              } @else {
                <p class="empty-state">{{ 'user.no_vehicles' | translate }}</p>
              }
              @if (hasRole(UserRole.Driver)) {
                <button class="btn btn-secondary mt-2" (click)="openAddVehicleModal()">
                  {{ 'user.add_vehicle' | translate }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- ========== VEHICLE MODAL ========== -->
    @if (showVehicleModal()) {
      <div class="modal-overlay" (click)="closeVehicleModal()">
        <div class="modal-content modal-vehicle" (click)="$event.stopPropagation()">
          <div class="modal-header-gradient">
            <span class="modal-header-icon">&#128663;</span>
            <h3>{{ (editingVehicleId() ? 'profile.edit_vehicle_title' : 'profile.add_vehicle_title') | translate }}</h3>
          </div>
          <div class="modal-body">
            <p class="hint-text">{{ 'profile.green_only_hint' | translate }}</p>

            <!-- Energy selector -->
            <label class="form-label">{{ 'profile.select_energy' | translate }}</label>
            <div class="energy-selector">
              @for (e of energyTypes; track e.value) {
                <div class="energy-card" [class.selected]="formData.energyType === e.value"
                     (click)="formData.energyType = e.value">
                  <span class="energy-card-icon">{{ e.icon }}</span>
                  <span class="energy-card-label">{{ e.labelKey | translate }}</span>
                </div>
              }
            </div>

            <!-- Brand -->
            <div class="form-group">
              <label class="form-label">{{ 'vehicle.brand' | translate }}</label>
              <select [(ngModel)]="formData.brandId" name="brandId" class="form-select">
                <option [ngValue]="0" disabled>{{ 'carpool.select_vehicle' | translate }}</option>
                @for (brand of brands; track brand.id) {
                  <option [ngValue]="brand.id">{{ brand.label }}</option>
                }
              </select>
            </div>

            <!-- Model -->
            <div class="form-group">
              <label class="form-label">{{ 'vehicle.model' | translate }}</label>
              <input type="text" [(ngModel)]="formData.model" name="model" class="form-input" />
            </div>

            <!-- Color dropdown -->
            <div class="form-group">
              <label class="form-label">{{ 'vehicle.color' | translate }}</label>
              <select [(ngModel)]="formData.color" name="color" class="form-select">
                <option value="" disabled>{{ 'vehicle.color' | translate }}</option>
                @for (c of vehicleColors; track c) {
                  <option [value]="c">{{ 'vehicle.colors.' + c | translate }}</option>
                }
              </select>
            </div>

            <!-- Registration -->
            <div class="form-group">
              <label class="form-label">{{ 'profile.license_plate' | translate }}</label>
              <input type="text" [(ngModel)]="formData.registrationNumber" name="registrationNumber"
                     class="form-input registration-input" placeholder="AB-123-CD" />
            </div>

            <!-- Seats -->
            <label class="form-label">{{ 'profile.seats_passenger' | translate }}</label>
            <div class="seats-selector">
              @for (n of seatOptions; track n) {
                <button type="button" class="seat-btn" [class.selected]="formData.seatCount === n"
                        (click)="formData.seatCount = n">{{ n }}</button>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeVehicleModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn btn-primary" (click)="submitVehicleModal()" [disabled]="saving()">
              {{ 'profile.save_vehicle' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ========== DRIVER MODAL ========== -->
    @if (showDriverModal()) {
      <div class="modal-overlay" (click)="closeDriverModal()">
        <div class="modal-content modal-driver" (click)="$event.stopPropagation()">
          <div class="modal-header-gradient">
            <span class="modal-header-icon">&#128663;</span>
            <h3>{{ 'profile.driver_pledge_title' | translate }}</h3>
          </div>
          <div class="modal-body">
            <div class="pledge-checks">
              <label class="pledge-check">
                <input type="checkbox" [(ngModel)]="driverLicenseConfirmed" />
                <span>{{ 'profile.confirm_license' | translate }}</span>
              </label>
              <label class="pledge-check">
                <input type="checkbox" [(ngModel)]="driverInsuranceConfirmed" />
                <span>{{ 'profile.confirm_insurance' | translate }}</span>
              </label>
            </div>
            <div class="pledge-warning">
              {{ 'profile.pledge_warning' | translate }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeDriverModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn btn-primary" (click)="confirmBecomeDriver()"
                    [disabled]="!driverLicenseConfirmed || !driverInsuranceConfirmed || becomingDriver()">
              {{ 'common.confirm' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ========== EDIT PROFILE MODAL ========== -->
    @if (showEditProfileModal()) {
      <div class="modal-overlay" (click)="closeEditProfileModal()">
        <div class="modal-content modal-profile" (click)="$event.stopPropagation()">
          <div class="modal-header-gradient">
            <span class="modal-header-icon">&#128100;</span>
            <h3>{{ 'profile.edit_modal_title' | translate }}</h3>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button class="tab" [class.active]="editProfileTab() === 'general'" (click)="editProfileTab.set('general')">
              {{ 'profile.tab_general' | translate }}
            </button>
            <button class="tab" [class.active]="editProfileTab() === 'security'" (click)="editProfileTab.set('security')">
              {{ 'profile.tab_security' | translate }}
            </button>
            <button class="tab" [class.active]="editProfileTab() === 'preferences'" (click)="editProfileTab.set('preferences')">
              {{ 'profile.tab_preferences' | translate }}
            </button>
            <button class="tab" [class.active]="editProfileTab() === 'advanced'" (click)="editProfileTab.set('advanced')">
              {{ 'profile.tab_advanced' | translate }}
            </button>
          </div>

          <div class="modal-body">

            <!-- TAB: General -->
            @if (editProfileTab() === 'general') {
              <div class="tab-content">
                <div class="profile-avatar-section">
                  <div class="profile-avatar-large">{{ getUserInitial() }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'auth.username' | translate }}</label>
                  <input type="text" [value]="user()?.username" disabled class="form-input disabled-input" />
                  <span class="field-hint">{{ 'profile.cannot_change' | translate }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'auth.email' | translate }}</label>
                  <input type="text" [value]="user()?.email" disabled class="form-input disabled-input" />
                  <span class="field-hint">{{ 'profile.cannot_change' | translate }}</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">{{ 'auth.first_name' | translate }}</label>
                    <input type="text" [(ngModel)]="profileForm.firstName" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">{{ 'auth.last_name' | translate }}</label>
                    <input type="text" [(ngModel)]="profileForm.lastName" class="form-input" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'auth.phone' | translate }}</label>
                  <input type="tel" [(ngModel)]="profileForm.phone" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'user.address' | translate }}</label>
                  <input type="text" [(ngModel)]="profileForm.address" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'user.birth_date' | translate }}</label>
                  <input type="date" [(ngModel)]="profileForm.birthDate" class="form-input" />
                </div>
                <div class="modal-footer">
                  <button class="btn btn-primary" (click)="saveProfile()" [disabled]="saving()">{{ 'common.save' | translate }}</button>
                </div>
              </div>
            }

            <!-- TAB: Security -->
            @if (editProfileTab() === 'security') {
              <div class="tab-content">
                <div class="form-group">
                  <label class="form-label">{{ 'profile.current_password' | translate }}</label>
                  <input type="password" [(ngModel)]="passwordForm.currentPassword" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'profile.new_password' | translate }}</label>
                  <input type="password" [(ngModel)]="passwordForm.newPassword" class="form-input" />
                  @if (passwordForm.newPassword) {
                    <div class="password-strength">
                      <div class="strength-bar">
                        <div class="strength-fill" [style.width]="getPasswordStrengthPercent() + '%'"
                             [class]="'strength-' + getPasswordStrengthLevel()"></div>
                      </div>
                      <span class="strength-label" [class]="'strength-' + getPasswordStrengthLevel()">
                        {{ 'profile.pwd_' + getPasswordStrengthLevel() | translate }}
                      </span>
                    </div>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'profile.confirm_password' | translate }}</label>
                  <input type="password" [(ngModel)]="passwordForm.confirmPassword" class="form-input" />
                  @if (passwordForm.confirmPassword) {
                    <span class="match-indicator" [class.match]="passwordForm.newPassword === passwordForm.confirmPassword"
                          [class.no-match]="passwordForm.newPassword !== passwordForm.confirmPassword">
                      {{ (passwordForm.newPassword === passwordForm.confirmPassword ? 'profile.pwd_match' : 'profile.pwd_nomatch') | translate }}
                    </span>
                  }
                </div>
                <div class="modal-footer">
                  <button class="btn btn-primary" (click)="changePassword()" [disabled]="saving() || !isPasswordFormValid()">
                    {{ 'profile.change_password' | translate }}
                  </button>
                </div>
              </div>
            }

            <!-- TAB: Preferences -->
            @if (editProfileTab() === 'preferences') {
              <div class="tab-content">
                <div class="toggle-row">
                  <span>{{ 'profile.pref_smoking' | translate }}</span>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="preferences.smokingAllowed" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <span>{{ 'profile.pref_pets' | translate }}</span>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="preferences.petsAllowed" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <span>{{ 'profile.pref_music' | translate }}</span>
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="preferences.musicAllowed" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="form-group mt-2">
                  <label class="form-label">{{ 'profile.pref_conversation' | translate }}</label>
                  <div class="conversation-selector">
                    @for (level of conversationLevels; track level.value) {
                      <button type="button" class="conv-btn" [class.selected]="preferences.conversationLevel === level.value"
                              (click)="preferences.conversationLevel = level.value">
                        {{ level.labelKey | translate }}
                      </button>
                    }
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-primary" (click)="savePreferences()" [disabled]="saving()">{{ 'common.save' | translate }}</button>
                </div>
              </div>
            }

            <!-- TAB: Advanced -->
            @if (editProfileTab() === 'advanced') {
              <div class="tab-content">
                <div class="danger-zone">
                  <h4>{{ 'profile.danger_zone' | translate }}</h4>
                  <div class="danger-item">
                    <div>
                      <strong>{{ 'profile.deactivate_account' | translate }}</strong>
                      <p class="danger-hint">{{ 'profile.deactivate_hint' | translate }}</p>
                    </div>
                    <button class="btn btn-danger-outline" (click)="deactivateAccount()">
                      {{ 'profile.deactivate_account' | translate }}
                    </button>
                  </div>
                  <div class="danger-item">
                    <div>
                      <strong>{{ 'profile.delete_account' | translate }}</strong>
                      <p class="danger-hint">{{ 'profile.delete_hint' | translate }}</p>
                    </div>
                    <button class="btn btn-danger" (click)="deleteAccount()">
                      {{ 'profile.delete_account' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== HERO ===== */
    .profile-hero {
      background: linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 100%);
      padding: 3rem 2rem;
      color: white;
    }
    .hero-content {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .hero-avatar {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem; font-weight: 700;
      flex-shrink: 0;
    }
    .hero-info { flex: 1; color: white; }
    .hero-info h1 { margin: 0; font-size: 1.8rem; color: white; }
    .hero-email { opacity: 0.85; margin: 0.25rem 0 0.5rem; color: white; }
    .hero-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .hero-badge {
      background: rgba(255,255,255,0.2); color: white;
      padding: 0.3rem 0.75rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 600;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .btn-hero-edit {
      background: rgba(255,255,255,0.15);
      color: white; border: 1px solid rgba(255,255,255,0.3);
      padding: 0.6rem 1.2rem; border-radius: 8px;
      cursor: pointer; font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-hero-edit:hover { background: rgba(255,255,255,0.25); }

    /* ===== GRID ===== */
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 3rem;
    }
    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .card-animate {
      animation: fadeInUp 0.4s ease-out both;
    }
    .card-animate:nth-child(1) { animation-delay: 0.05s; }
    .card-animate:nth-child(2) { animation-delay: 0.1s; }
    .card-animate:nth-child(3) { animation-delay: 0.15s; }
    .card-animate:nth-child(4) { animation-delay: 0.2s; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .card-header-icon {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #f0f0f0;
    }
    .card-icon { font-size: 1.5rem; }
    .card-header-icon h2 { margin: 0; font-size: 1.1rem; color: var(--dark-green); }
    .card-body { padding: 1.25rem 1.5rem; }

    /* Info rows */
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 0; border-bottom: 1px solid #f5f5f5;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; font-size: 0.9rem; }
    .info-value { font-weight: 600; }
    .credit-green { color: var(--primary-green); }
    .stars { color: #f59e0b; letter-spacing: 1px; }
    .review-count { color: #999; font-weight: 400; font-size: 0.85rem; margin-left: 4px; }

    /* Credits card */
    .credits-card-body { text-align: center; }
    .credits-display { margin-bottom: 1.5rem; }
    .credits-big {
      font-size: 3rem; font-weight: 800;
      color: var(--primary-green); display: block; line-height: 1;
    }
    .credits-label { color: #888; font-size: 0.9rem; display: block; margin-top: 0.25rem; }
    .credits-subtitle { font-size: 0.9rem; color: #666; margin-bottom: 0.75rem; }
    .credits-buttons { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
    .btn-credit {
      background: var(--primary-green); color: white; border: none;
      padding: 0.5rem 1.2rem; border-radius: 20px; cursor: pointer;
      font-weight: 700; font-size: 0.95rem; transition: all 0.2s;
    }
    .btn-credit:hover:not(:disabled) { background: var(--dark-green); transform: translateY(-1px); }
    .btn-credit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Driver card */
    .driver-card-body { display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem; }
    .driver-status-badge {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600;
    }
    .driver-status-badge.active { background: #e8f5e9; color: var(--dark-green); }
    .driver-status-badge.inactive { background: #f5f5f5; color: #888; }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%;
      display: inline-block;
    }
    .driver-status-badge.active .status-dot { background: var(--primary-green); }
    .driver-status-badge.inactive .status-dot { background: #ccc; }

    /* Vehicles */
    .vehicle-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem; margin-bottom: 0.5rem;
      background: #f9fafb; border-radius: 8px;
    }
    .vehicle-item-left { display: flex; align-items: center; gap: 0.75rem; }
    .energy-badge {
      padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem;
      font-weight: 600; white-space: nowrap;
    }
    .energy-badge.energy-electric { background: #e0f7fa; color: #00838f; }
    .energy-badge.energy-hybrid { background: #f1f8e9; color: #558b2f; }
    .energy-badge.energy-lpg { background: #fff3e0; color: #e65100; }
    .vehicle-item-info { display: flex; flex-direction: column; }
    .vehicle-item-info strong { font-size: 0.95rem; }
    .vehicle-meta { font-size: 0.8rem; color: #888; }
    .vehicle-item-actions { display: flex; gap: 0.25rem; }
    .btn-icon {
      background: none; border: 1px solid #e0e0e0; border-radius: 6px;
      padding: 0.3rem 0.5rem; cursor: pointer; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon-danger:hover { background: #fbe9e7; border-color: #ef5350; }
    .empty-state { color: #999; font-style: italic; text-align: center; padding: 1rem 0; }

    /* ===== MODALS ===== */
    .modal-header-gradient {
      background: linear-gradient(135deg, var(--dark-green), var(--primary-green));
      color: white; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .modal-header-gradient h3 { margin: 0; }
    .modal-header-icon { font-size: 1.5rem; }
    .modal-body { padding: 1.5rem; max-height: 60vh; overflow-y: auto; }
    .modal-footer {
      padding: 1rem 1.5rem; border-top: 1px solid #eee;
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }
    .modal-vehicle { max-width: 560px; width: 95%; }
    .modal-driver { max-width: 500px; width: 95%; }
    .modal-profile { max-width: 600px; width: 95%; }
    .hint-text { color: #888; font-size: 0.85rem; margin-bottom: 1rem; font-style: italic; }

    /* Energy selector */
    .energy-selector { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
    .energy-card {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      padding: 1rem; border: 2px solid #e0e0e0; border-radius: 10px;
      cursor: pointer; transition: all 0.2s; background: white;
    }
    .energy-card:hover { border-color: var(--primary-green); }
    .energy-card.selected { border-color: var(--primary-green); background: var(--very-light-green); }
    .energy-card-icon { font-size: 1.8rem; margin-bottom: 0.25rem; }
    .energy-card-label { font-size: 0.8rem; font-weight: 600; }

    /* Seats selector */
    .seats-selector { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .seat-btn {
      width: 40px; height: 40px; border-radius: 8px;
      border: 2px solid #e0e0e0; background: white;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .seat-btn:hover { border-color: var(--primary-green); }
    .seat-btn.selected { background: var(--primary-green); color: white; border-color: var(--primary-green); }

    /* Form elements */
    .form-label { font-size: 0.85rem; font-weight: 600; color: #555; display: block; margin-bottom: 0.25rem; margin-top: 0.75rem; }
    .form-input, .form-select {
      width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #ddd;
      border-radius: 8px; font-size: 0.9rem; transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus, .form-select:focus { border-color: var(--primary-green); outline: none; }
    .disabled-input { background: #f5f5f5; color: #999; cursor: not-allowed; }
    .field-hint { font-size: 0.75rem; color: #bbb; font-style: italic; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .registration-input { text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }

    /* Driver modal */
    .pledge-checks { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    .pledge-check { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; }
    .pledge-check input[type="checkbox"] {
      width: 20px; height: 20px; accent-color: var(--primary-green);
      flex-shrink: 0; margin-top: 2px;
    }
    .pledge-warning {
      background: #fff8e1; border-left: 3px solid #ffc107;
      padding: 0.75rem 1rem; font-size: 0.85rem; color: #795548;
      border-radius: 0 6px 6px 0;
    }

    /* Profile edit tabs + content */
    .tab-content { min-height: 200px; }
    .profile-avatar-section { display: flex; justify-content: center; margin-bottom: 1rem; }
    .profile-avatar-large {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--primary-green); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; font-weight: 700;
    }

    /* Password strength */
    .password-strength { margin-top: 0.5rem; }
    .strength-bar { height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; transition: width 0.3s; border-radius: 2px; }
    .strength-fill.strength-weak { background: #ef5350; }
    .strength-fill.strength-medium { background: #ffa726; }
    .strength-fill.strength-good { background: #66bb6a; }
    .strength-fill.strength-excellent { background: var(--primary-green); }
    .strength-label { font-size: 0.75rem; margin-top: 0.25rem; display: block; }
    .strength-label.strength-weak { color: #ef5350; }
    .strength-label.strength-medium { color: #ffa726; }
    .strength-label.strength-good { color: #66bb6a; }
    .strength-label.strength-excellent { color: var(--primary-green); }
    .match-indicator { font-size: 0.8rem; display: block; margin-top: 0.25rem; }
    .match-indicator.match { color: var(--primary-green); }
    .match-indicator.no-match { color: #ef5350; }

    /* Toggle switches */
    .toggle-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0;
    }
    .toggle {
      position: relative; display: inline-block;
      width: 48px; height: 26px;
    }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #ccc; border-radius: 26px; transition: 0.3s;
    }
    .toggle-slider::before {
      content: ''; position: absolute;
      height: 20px; width: 20px;
      left: 3px; bottom: 3px;
      background: white; border-radius: 50%; transition: 0.3s;
    }
    .toggle input:checked + .toggle-slider { background: var(--primary-green); }
    .toggle input:checked + .toggle-slider::before { transform: translateX(22px); }

    /* Conversation level */
    .conversation-selector { display: flex; gap: 0.5rem; }
    .conv-btn {
      flex: 1; padding: 0.5rem; border: 2px solid #e0e0e0;
      border-radius: 8px; background: white; cursor: pointer;
      font-weight: 600; font-size: 0.85rem; transition: all 0.2s;
    }
    .conv-btn:hover { border-color: var(--primary-green); }
    .conv-btn.selected { background: var(--primary-green); color: white; border-color: var(--primary-green); }

    /* Danger zone */
    .danger-zone h4 { color: #c62828; margin-bottom: 1rem; }
    .danger-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem; margin-bottom: 0.75rem;
      border: 1px solid #ffcdd2; border-radius: 8px;
      gap: 1rem;
    }
    .danger-hint { font-size: 0.8rem; color: #888; margin: 0.25rem 0 0; }
    .btn-danger-outline {
      background: white; color: #c62828; border: 1px solid #c62828;
      padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
      font-weight: 600; white-space: nowrap; transition: all 0.2s;
    }
    .btn-danger-outline:hover { background: #ffebee; }
    .btn-danger {
      background: #c62828; color: white; border: none;
      padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
      font-weight: 600; white-space: nowrap; transition: all 0.2s;
    }
    .btn-danger:hover { background: #b71c1c; }

    .mt-2 { margin-top: 1rem; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .hero-content { flex-direction: column; text-align: center; }
      .hero-badges { justify-content: center; }
      .profile-grid { grid-template-columns: 1fr; }
      .modal-vehicle, .modal-driver, .modal-profile { width: 100%; max-width: 100%; border-radius: 0; }
      .energy-selector { flex-direction: column; }
      .form-row { grid-template-columns: 1fr; }
      .danger-item { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  UserRole = UserRole;

  user = signal<User | null>(null);
  vehicles = signal<Vehicle[]>([]);
  showVehicleModal = signal(false);
  showDriverModal = signal(false);
  showEditProfileModal = signal(false);
  editProfileTab = signal<'general' | 'preferences' | 'security' | 'advanced'>('general');
  saving = signal(false);
  addingCredits = signal(false);
  becomingDriver = signal(false);
  deletingVehicleId = signal<number | null>(null);
  editingVehicleId = signal<number | null>(null);

  driverLicenseConfirmed = false;
  driverInsuranceConfirmed = false;

  formData: CreateVehicle = this.emptyVehicle();

  profileForm = { firstName: '', lastName: '', phone: '', address: '', birthDate: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  preferences: UserPreferences = { smokingAllowed: false, petsAllowed: false, musicAllowed: false, conversationLevel: 'moderate' };

  brands = [
    { id: 1, label: 'Renault' },
    { id: 2, label: 'Peugeot' },
    { id: 3, label: 'Citroën' },
    { id: 4, label: 'Tesla' },
    { id: 5, label: 'Volkswagen' },
    { id: 6, label: 'Toyota' },
    { id: 7, label: 'BMW' },
    { id: 8, label: 'Mercedes' },
  ];

  creditOptions = [10, 20, 50, 100];
  seatOptions = [1, 2, 3, 4, 5, 6, 7];

  vehicleColors = ['black', 'white', 'gray', 'silver', 'red', 'blue', 'green', 'brown', 'beige', 'other'];

  energyTypes = [
    { value: 'Electric', icon: '\u26A1', labelKey: 'vehicle.types.electric' },
    { value: 'Hybrid', icon: '\uD83D\uDD0B', labelKey: 'vehicle.types.hybrid' },
    { value: 'LPG', icon: '\uD83C\uDF3F', labelKey: 'vehicle.types.lpg' },
  ];

  conversationLevels = [
    { value: 'quiet' as const, labelKey: 'profile.pref_quiet' },
    { value: 'moderate' as const, labelKey: 'profile.pref_moderate' },
    { value: 'chatty' as const, labelKey: 'profile.pref_chatty' },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
    this.loadPreferences();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeVehicleModal();
    this.closeDriverModal();
    this.closeEditProfileModal();
  }

  // ========== DATA LOADING ==========

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
        this.authService.refreshCurrentUser();
        this.profileForm = {
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
        };
      },
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => this.vehicles.set(data),
    });
  }

  loadPreferences() {
    this.userService.getPreferences().subscribe({
      next: (data) => {
        if (data && Object.keys(data).length > 0) {
          this.preferences = { ...this.preferences, ...data };
        }
      },
    });
  }

  // ========== UTILITIES ==========

  hasRole(role: UserRole): boolean {
    return this.user()?.roles?.includes(role) ?? false;
  }

  getUserInitial(): string {
    return this.user()?.username?.charAt(0).toUpperCase() ?? '?';
  }

  getEnergyIcon = energyIcon;

  private energyClassMap: Record<string, string> = { Electric: 'energy-electric', Hybrid: 'energy-hybrid', LPG: 'energy-lpg' };

  getEnergyBadgeClass(type: string): string {
    return this.energyClassMap[type] ?? 'energy-electric';
  }

  getEnergyShortLabel(type: string): string {
    const key = this.energyTypes.find(e => e.value === type)?.labelKey;
    return key ? this.translate.instant(key) : type;
  }

  getStars(rating: number): string {
    const full = Math.round(rating);
    return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
  }

  // ========== CREDITS ==========

  addCredits(amount: number) {
    this.addingCredits.set(true);
    this.userService.addCredits(amount).subscribe({
      next: () => {
        this.addingCredits.set(false);
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.addingCredits.set(false);
      },
    });
  }

  // ========== VEHICLE MODAL ==========

  openAddVehicleModal() {
    this.editingVehicleId.set(null);
    this.formData = this.emptyVehicle();
    this.showVehicleModal.set(true);
  }

  openEditVehicleModal(v: Vehicle) {
    this.editingVehicleId.set(v.vehicleId);
    this.formData = {
      brandId: v.brandId,
      model: v.model,
      registrationNumber: v.registrationNumber,
      energyType: v.energyType,
      color: v.color,
      seatCount: v.seatCount,
    };
    this.showVehicleModal.set(true);
  }

  closeVehicleModal() {
    this.showVehicleModal.set(false);
    this.editingVehicleId.set(null);
  }

  submitVehicleModal() {
    this.saving.set(true);
    const editId = this.editingVehicleId();
    const obs = editId
      ? this.userService.updateVehicle(editId, this.formData)
      : this.userService.addVehicle(this.formData);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeVehicleModal();
        this.loadVehicles();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.saving.set(false);
      },
    });
  }

  deleteVehicle(id: number) {
    if (!confirm(this.translate.instant('profile.delete_vehicle_confirm'))) return;
    this.deletingVehicleId.set(id);
    this.userService.deleteVehicle(id).subscribe({
      next: () => {
        this.deletingVehicleId.set(null);
        this.loadVehicles();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.deletingVehicleId.set(null);
      },
    });
  }

  // ========== DRIVER MODAL ==========

  openDriverModal() {
    this.driverLicenseConfirmed = false;
    this.driverInsuranceConfirmed = false;
    this.showDriverModal.set(true);
  }

  closeDriverModal() {
    this.showDriverModal.set(false);
  }

  confirmBecomeDriver() {
    this.becomingDriver.set(true);
    this.userService.addRole(RoleId.Driver).subscribe({
      next: (response: any) => {
        if (response.token) localStorage.setItem('token', response.token);
        this.becomingDriver.set(false);
        this.closeDriverModal();
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.becomingDriver.set(false);
      },
    });
  }

  // ========== EDIT PROFILE MODAL ==========

  openEditProfileModal() {
    this.editProfileTab.set('general');
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showEditProfileModal.set(true);
  }

  closeEditProfileModal() {
    this.showEditProfileModal.set(false);
  }

  saveProfile() {
    this.saving.set(true);
    const data: Partial<User> = {
      firstName: this.profileForm.firstName || undefined,
      lastName: this.profileForm.lastName || undefined,
      phone: this.profileForm.phone || undefined,
      address: this.profileForm.address || undefined,
      birthDate: this.profileForm.birthDate ? new Date(this.profileForm.birthDate) : undefined,
    };
    this.userService.updateProfile(data).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadProfile();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.saving.set(false);
      },
    });
  }

  // ========== SECURITY ==========

  getPasswordStrengthPercent(): number {
    const pwd = this.passwordForm.newPassword;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score * 25;
  }

  getPasswordStrengthLevel(): string {
    const pct = this.getPasswordStrengthPercent();
    if (pct <= 25) return 'weak';
    if (pct <= 50) return 'medium';
    if (pct <= 75) return 'good';
    return 'excellent';
  }

  isPasswordFormValid(): boolean {
    return (
      this.passwordForm.currentPassword.length > 0 &&
      this.passwordForm.newPassword.length >= 8 &&
      this.passwordForm.newPassword === this.passwordForm.confirmPassword
    );
  }

  changePassword() {
    this.saving.set(true);
    this.userService.changePassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: (res: any) => {
        if (res.token) localStorage.setItem('token', res.token);
        alert(this.translate.instant('profile.password_changed'));
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.saving.set(false);
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.saving.set(false);
      },
    });
  }

  // ========== PREFERENCES ==========

  savePreferences() {
    this.saving.set(true);
    this.userService.savePreferences(this.preferences).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.saving.set(false);
      },
    });
  }

  // ========== DANGER ZONE ==========

  deactivateAccount() {
    if (!confirm(this.translate.instant('profile.deactivate_confirm'))) return;
    this.userService.deactivateAccount().subscribe({
      next: () => {
        alert(this.translate.instant('profile.account_deactivated'));
        this.authService.logout();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
      },
    });
  }

  deleteAccount() {
    const password = prompt(this.translate.instant('profile.delete_confirm'));
    if (!password) return;
    this.userService.deleteAccount(password).subscribe({
      next: () => {
        alert(this.translate.instant('profile.account_deleted'));
        this.authService.logout();
      },
      error: (err) => {
        alert(err.error?.message || this.translate.instant('messages.error_occurred'));
      },
    });
  }

  private emptyVehicle(): CreateVehicle {
    return { brandId: 0, model: '', registrationNumber: '', energyType: '', color: '', seatCount: 4 };
  }
}
