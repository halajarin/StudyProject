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
      <div class="profile-hero-inner">
        <div class="profile-avatar">{{ getUserInitial() }}</div>
        <div class="profile-hero-info">
          <h1>{{ user()?.username }}</h1>
          <p>{{ user()?.email }}</p>
          <div class="profile-hero-badges">
            @for (role of user()?.roles ?? []; track role) {
              <span class="hero-badge">{{ getRoleIcon(role) }} {{ 'admin.roles.' + role | translate }}</span>
            }
          </div>
        </div>
        <button class="btn-hero-edit" (click)="openEditProfileModal()">
          ✏️ {{ 'profile.edit_profile' | translate }}
        </button>
      </div>
    </div>

    @if (user()) {
      <!-- ========== CARDS GRID ========== -->
      <div class="profile-layout">

        <!-- Card: Personal Info -->
        <div class="p-card">
          <div class="p-card-header">
            <div class="p-card-icon icon-user">👤</div>
            <div class="p-card-title">{{ 'profile.personal_info' | translate }}</div>
            <a class="p-card-action" (click)="openEditProfileModal()">✏️ {{ 'common.edit' | translate }}</a>
          </div>
          <div class="p-card-body">
            <div class="info-rows">
              <div class="info-row">
                <span class="info-row-label">👤 {{ 'auth.username' | translate }}</span>
                <span class="info-row-value">{{ user()?.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-row-label">📧 {{ 'auth.email' | translate }}</span>
                <span class="info-row-value">{{ user()?.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-row-label">🪙 {{ 'user.credits' | translate }}</span>
                <span class="info-row-value green">{{ user()?.credits }}</span>
              </div>
              <div class="info-row">
                <span class="info-row-label">⭐ {{ 'carpool.rating' | translate }}</span>
                <span class="info-row-value">
                  <span class="rating-display">
                    <span class="rating-stars">{{ getStars(user()?.averageRating ?? 0) }}</span>
                    <span class="rating-score">{{ (user()?.averageRating ?? 0).toFixed(1) }}</span>
                    <span class="rating-count">/ 5 · {{ user()?.reviewCount ?? 0 }} {{ 'review.reviews' | translate }}</span>
                  </span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-row-label">🏷️ {{ 'user.roles' | translate }}</span>
                <span class="info-row-value">{{ getTranslatedRoles() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card: Credits -->
        <div class="p-card">
          <div class="p-card-header">
            <div class="p-card-icon icon-credit">🪙</div>
            <div class="p-card-title">{{ 'profile.credits_balance' | translate }}</div>
          </div>
          <div class="p-card-body">
            <div class="credit-balance">
              <span class="credit-balance-icon">🪙</span>
              <div>
                <div class="credit-balance-amount">{{ user()?.credits }}</div>
                <div class="credit-balance-label">{{ 'profile.available_credits' | translate }}</div>
              </div>
            </div>
            <label class="recharge-label">{{ 'profile.recharge_credits' | translate }}</label>
            <div class="credit-buttons">
              @for (option of creditOptions; track option) {
                <button class="btn-credit" (click)="addCredits(option)" [disabled]="addingCredits()">
                  +{{ option }}<span>{{ 'profile.free' | translate }}</span>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Card: Driver Status -->
        <div class="p-card">
          <div class="p-card-header">
            <div class="p-card-icon icon-driver">🚘</div>
            <div class="p-card-title">{{ 'profile.driver_status' | translate }}</div>
          </div>
          <div class="p-card-body">
            @if (hasRole(UserRole.Driver)) {
              <div class="driver-status active">
                <span class="driver-status-icon">✅</span>
                <div class="driver-status-text">
                  <div class="driver-status-title">{{ 'profile.driver_active' | translate }}</div>
                  <div class="driver-status-sub">{{ 'profile.driver_confirmed_sub' | translate }}</div>
                </div>
              </div>
              <div class="info-rows" style="margin-top: 12px;">
                <div class="info-row">
                  <span class="info-row-label">🪪 {{ 'profile.driver_license' | translate }}</span>
                  <span class="info-row-value green">✅ {{ 'profile.confirmed_m' | translate }}</span>
                </div>
                <div class="info-row">
                  <span class="info-row-label">🛡️ {{ 'profile.driver_insurance' | translate }}</span>
                  <span class="info-row-value green">✅ {{ 'profile.confirmed_f' | translate }}</span>
                </div>
              </div>
            } @else {
              <div class="driver-status inactive">
                <span class="driver-status-icon">⏸️</span>
                <div class="driver-status-text">
                  <div class="driver-status-title">{{ 'profile.driver_inactive' | translate }}</div>
                  <div class="driver-status-sub">{{ 'profile.driver_inactive_sub' | translate }}</div>
                </div>
              </div>
              <button class="btn-driver green" (click)="openDriverModal()" style="margin-top: 12px;">
                {{ 'profile.become_driver' | translate }}
              </button>
            }
          </div>
        </div>

        <!-- Card: Vehicles -->
        <div class="p-card">
          <div class="p-card-header">
            <div class="p-card-icon icon-vehicle">🚗</div>
            <div class="p-card-title">{{ 'user.my_vehicles' | translate }}</div>
            @if (hasRole(UserRole.Driver)) {
              <a class="p-card-action" (click)="openAddVehicleModal()">➕ {{ 'common.add' | translate }}</a>
            }
          </div>
          <div class="p-card-body">
            @if (vehicles().length > 0) {
              <div class="vehicles-list">
                @for (vehicle of vehicles(); track vehicle.vehicleId) {
                  <div class="vehicle-card">
                    <div class="v-energy-badge" [ngClass]="getEnergyTypeClass(vehicle.energyType)">
                      <span class="v-energy-icon">{{ getEnergyIcon(vehicle.energyType) }}</span>
                      <span class="v-energy-label">{{ getEnergyAbbr(vehicle.energyType) }}</span>
                    </div>
                    <div class="v-info">
                      <div class="v-name">{{ vehicle.brandLabel }} {{ vehicle.model }}</div>
                      <div class="v-meta">{{ vehicle.color }} · {{ vehicle.seatCount }} {{ 'profile.seats_passenger' | translate }} · {{ vehicle.registrationNumber }}</div>
                      <span class="v-tag" [ngClass]="getEnergyTypeClass(vehicle.energyType)">
                        {{ getEnergyIcon(vehicle.energyType) }} {{ getEnergyShortLabel(vehicle.energyType) }} — {{ getEmissionLabel(vehicle.energyType) }}
                      </span>
                    </div>
                    @if (hasRole(UserRole.Driver)) {
                      <div class="v-actions">
                        <button class="v-btn" (click)="openEditVehicleModal(vehicle)" title="Modifier">✏️</button>
                        <button class="v-btn danger" (click)="deleteVehicle(vehicle.vehicleId)"
                                [disabled]="deletingVehicleId() === vehicle.vehicleId" title="Supprimer">🗑️</button>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">{{ 'user.no_vehicles' | translate }}</p>
            }
            @if (hasRole(UserRole.Driver)) {
              <button class="btn-add-vehicle" (click)="openAddVehicleModal()" style="margin-top: 12px;">
                ➕ {{ 'user.add_vehicle' | translate }}
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- ========== VEHICLE MODAL ========== -->
    @if (showVehicleModal()) {
      <div class="modal-overlay" (click)="closeVehicleModal()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <!-- Cyan gradient header -->
          <div class="modal-header-vehicle">
            <div class="modal-header-inner">
              <div class="modal-header-icon-box vehicle-icon-box">🚗</div>
              <div class="modal-header-text">
                <div class="modal-title">{{ (editingVehicleId() ? 'profile.edit_vehicle_title' : 'profile.add_vehicle_title') | translate }}</div>
                <div class="modal-subtitle">{{ 'profile.green_only_hint' | translate }}</div>
              </div>
              <button class="modal-close-btn" (click)="closeVehicleModal()">✕</button>
            </div>
          </div>

          <div class="modal-body">
            <!-- Energy selector -->
            <div class="m-field">
              <label class="m-label">{{ 'profile.select_energy' | translate }} <span class="required">*</span></label>
              <div class="energy-select">
                @for (e of energyTypes; track e.value) {
                  <div class="energy-opt" [ngClass]="e.cssClass"
                       [class.selected]="formData.energyType === e.value"
                       (click)="formData.energyType = e.value">
                    <div class="energy-opt-circle" [style.background]="e.bgColor">{{ e.icon }}</div>
                    <span class="energy-opt-label">{{ e.labelKey | translate }}</span>
                    <span class="energy-opt-emission">{{ e.emissionKey | translate }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Separator -->
            <div class="separator"></div>

            <!-- Brand / Model -->
            <div class="m-row">
              <div class="m-field">
                <label class="m-label">{{ 'vehicle.brand' | translate }} <span class="required">*</span></label>
                <select [(ngModel)]="formData.brandId" name="brandId" class="m-input">
                  <option [ngValue]="0" disabled>{{ 'carpool.select_vehicle' | translate }}</option>
                  @for (brand of brands; track brand.id) {
                    <option [ngValue]="brand.id">{{ brand.label }}</option>
                  }
                </select>
              </div>
              <div class="m-field">
                <label class="m-label">{{ 'vehicle.model' | translate }} <span class="required">*</span></label>
                <input type="text" [(ngModel)]="formData.model" name="model" class="m-input" />
              </div>
            </div>

            <!-- Color -->
            <div class="m-row">
              <div class="m-field">
                <label class="m-label">{{ 'vehicle.color' | translate }} <span class="required">*</span></label>
                <select [(ngModel)]="formData.color" name="color" class="m-input">
                  <option value="" disabled>{{ 'vehicle.color' | translate }}</option>
                  @for (c of vehicleColors; track c) {
                    <option [value]="c">{{ 'vehicle.colors.' + c | translate }}</option>
                  }
                </select>
              </div>
              <div class="m-field">
                <label class="m-label">{{ 'profile.license_plate' | translate }} <span class="required">*</span></label>
                <div class="plate-wrapper">
                  <div class="plate-strip"><span>F</span></div>
                  <input type="text" [(ngModel)]="formData.registrationNumber" name="registrationNumber"
                         class="m-input m-plaque" placeholder="AB-123-CD" maxlength="9" />
                </div>
              </div>
            </div>

            <!-- Separator -->
            <div class="separator"></div>

            <!-- Seats -->
            <div class="m-field">
              <label class="m-label">{{ 'profile.seats_passenger' | translate }} <span class="required">*</span></label>
              <div class="seats-selector">
                @for (n of seatOptions; track n) {
                  <div class="place-btn" [class.active]="formData.seatCount === n"
                       (click)="formData.seatCount = n">{{ n }}</div>
                }
              </div>
            </div>
          </div>

          <div class="modal-footer-green">
            <button class="btn-modal secondary" (click)="closeVehicleModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn-modal primary" (click)="submitVehicleModal()" [disabled]="saving()">
              ✅ {{ 'profile.save_vehicle' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ========== DRIVER MODAL ========== -->
    @if (showDriverModal()) {
      <div class="modal-overlay" (click)="closeDriverModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <!-- Blue gradient header -->
          <div class="modal-header-driver">
            <div class="modal-header-inner">
              <div class="modal-header-icon-box driver-icon-box">🚘</div>
              <div class="modal-header-text">
                <div class="modal-title">{{ 'profile.driver_pledge_title' | translate }}</div>
                <div class="modal-subtitle">{{ 'profile.pledge_section_title' | translate }}</div>
              </div>
              <button class="modal-close-btn" (click)="closeDriverModal()">✕</button>
            </div>
          </div>

          <div class="modal-body">
            <!-- Pledge section -->
            <div class="pledge-card">
              <div class="pledge-card-header">
                <span>📜</span>
                <span class="pledge-card-title">{{ 'profile.pledge_section_title' | translate }}</span>
              </div>
              <div class="pledge-card-body">
                <p class="pledge-intro">{{ 'profile.pledge_intro' | translate }}</p>

                <!-- Check permis -->
                <div class="driver-confirm-check" [class.checked]="driverLicenseConfirmed"
                     (click)="driverLicenseConfirmed = !driverLicenseConfirmed">
                  <div class="driver-check-box">
                    @if (driverLicenseConfirmed) {
                      <span class="check-icon">✓</span>
                    }
                  </div>
                  <div>
                    <div class="check-title">🪪 {{ 'profile.driver_license' | translate }}</div>
                    <div class="check-desc">{{ 'profile.confirm_license_desc' | translate }}</div>
                  </div>
                </div>

                <!-- Check assurance -->
                <div class="driver-confirm-check" [class.checked]="driverInsuranceConfirmed"
                     (click)="driverInsuranceConfirmed = !driverInsuranceConfirmed">
                  <div class="driver-check-box">
                    @if (driverInsuranceConfirmed) {
                      <span class="check-icon">✓</span>
                    }
                  </div>
                  <div>
                    <div class="check-title">🛡️ {{ 'profile.driver_insurance' | translate }}</div>
                    <div class="check-desc">{{ 'profile.confirm_insurance_desc' | translate }}</div>
                  </div>
                </div>

                <!-- Legal warning -->
                <div class="pledge-warning">
                  ⚠️ {{ 'profile.pledge_warning' | translate }}
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-green">
            <button class="btn-modal secondary" (click)="closeDriverModal()">{{ 'common.cancel' | translate }}</button>
            <button class="btn-modal primary" (click)="confirmBecomeDriver()"
                    [disabled]="!driverLicenseConfirmed || !driverInsuranceConfirmed || becomingDriver()">
              ✅ {{ 'profile.confirm_and_save' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ========== EDIT PROFILE MODAL ========== -->
    @if (showEditProfileModal()) {
      <div class="modal-overlay" (click)="closeEditProfileModal()">
        <div class="modal modal-large" (click)="$event.stopPropagation()">
          <!-- Flat header -->
          <div class="modal-header-flat">
            <div class="modal-header-icon-box profile-icon-box">👤</div>
            <div class="modal-title">{{ 'profile.edit_modal_title' | translate }}</div>
            <button class="modal-close-btn" (click)="closeEditProfileModal()">✕</button>
          </div>

          <!-- Tabs -->
          <div class="modal-tabs">
            <div class="modal-tab" [class.active]="editProfileTab() === 'general'" (click)="editProfileTab.set('general')">
              👤 {{ 'profile.tab_general' | translate }}
            </div>
            <div class="modal-tab" [class.active]="editProfileTab() === 'security'" (click)="editProfileTab.set('security')">
              🔒 {{ 'profile.tab_security' | translate }}
            </div>
            <div class="modal-tab" [class.active]="editProfileTab() === 'preferences'" (click)="editProfileTab.set('preferences')">
              ⚙️ {{ 'profile.tab_preferences' | translate }}
            </div>
            <div class="modal-tab" [class.active]="editProfileTab() === 'advanced'" (click)="editProfileTab.set('advanced')">
              ⚠️ {{ 'profile.tab_advanced' | translate }}
            </div>
          </div>

          <!-- TAB: General -->
          @if (editProfileTab() === 'general') {
            <div class="modal-body">
              <!-- Avatar display -->
              <div class="avatar-upload">
                <div class="avatar-preview">{{ getUserInitial() }}</div>
                <div class="avatar-upload-info">
                  <div class="avatar-upload-title">{{ 'auth.username' | translate }}</div>
                  <div class="avatar-upload-hint">{{ user()?.email }}</div>
                </div>
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'auth.username' | translate }}</label>
                <input type="text" [value]="user()?.username" disabled class="m-input disabled" />
                <div class="m-hint">{{ 'profile.cannot_change' | translate }}</div>
              </div>

              <div class="m-row">
                <div class="m-field">
                  <label class="m-label">{{ 'auth.first_name' | translate }}</label>
                  <input type="text" [(ngModel)]="profileForm.firstName" class="m-input" />
                </div>
                <div class="m-field">
                  <label class="m-label">{{ 'auth.last_name' | translate }}</label>
                  <input type="text" [(ngModel)]="profileForm.lastName" class="m-input" />
                </div>
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'auth.email' | translate }}</label>
                <input type="email" [value]="user()?.email" disabled class="m-input disabled" />
                <div class="m-hint">{{ 'profile.cannot_change' | translate }}</div>
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'auth.phone' | translate }}</label>
                <input type="tel" [(ngModel)]="profileForm.phone" class="m-input" />
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'user.address' | translate }}</label>
                <input type="text" [(ngModel)]="profileForm.address" class="m-input" />
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'user.birth_date' | translate }}</label>
                <input type="date" [(ngModel)]="profileForm.birthDate" class="m-input" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-modal secondary" (click)="closeEditProfileModal()">{{ 'common.cancel' | translate }}</button>
              <button class="btn-modal primary" (click)="saveProfile()" [disabled]="saving()">
                ✅ {{ 'common.save' | translate }}
              </button>
            </div>
          }

          <!-- TAB: Security -->
          @if (editProfileTab() === 'security') {
            <div class="modal-body">
              <p class="tab-desc">{{ 'profile.security_desc' | translate }}</p>

              <div class="m-field">
                <label class="m-label">{{ 'profile.current_password' | translate }} <span class="required">*</span></label>
                <input type="password" [(ngModel)]="passwordForm.currentPassword" class="m-input" placeholder="••••••••" />
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'profile.new_password' | translate }} <span class="required">*</span></label>
                <input type="password" [(ngModel)]="passwordForm.newPassword" class="m-input" placeholder="Min. 8 caractères" />
                @if (passwordForm.newPassword) {
                  <div class="pwd-strength">
                    @for (i of strengthBars; track i) {
                      <div class="pwd-bar" [ngClass]="i < getPasswordStrengthScore() ? getPasswordBarClass() : ''"></div>
                    }
                  </div>
                  <div class="pwd-label" [style.color]="getPasswordLabelColor()">
                    {{ 'profile.pwd_' + getPasswordStrengthLevel() | translate }}
                  </div>
                }
              </div>

              <div class="m-field">
                <label class="m-label">{{ 'profile.confirm_password' | translate }} <span class="required">*</span></label>
                <input type="password" [(ngModel)]="passwordForm.confirmPassword" class="m-input" />
                @if (passwordForm.confirmPassword) {
                  <div class="m-hint" [style.color]="passwordForm.newPassword === passwordForm.confirmPassword ? 'var(--eco-primary)' : 'var(--eco-danger)'">
                    {{ passwordForm.newPassword === passwordForm.confirmPassword ? '✅' : '❌' }}
                    {{ (passwordForm.newPassword === passwordForm.confirmPassword ? 'profile.pwd_match' : 'profile.pwd_nomatch') | translate }}
                  </div>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-modal secondary" (click)="closeEditProfileModal()">{{ 'common.cancel' | translate }}</button>
              <button class="btn-modal primary" (click)="changePassword()" [disabled]="saving() || !isPasswordFormValid()">
                🔒 {{ 'profile.change_password' | translate }}
              </button>
            </div>
          }

          <!-- TAB: Preferences -->
          @if (editProfileTab() === 'preferences') {
            <div class="modal-body">
              <p class="tab-desc">{{ 'profile.preferences_desc' | translate }}</p>

              <div class="toggle-row">
                <div>
                  <div class="toggle-text">🚬 {{ 'profile.pref_smoking' | translate }}</div>
                  <div class="toggle-sub">{{ 'profile.pref_smoking_desc' | translate }}</div>
                </div>
                <div class="toggle-switch" [class.on]="preferences.smokingAllowed"
                     (click)="preferences.smokingAllowed = !preferences.smokingAllowed"></div>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-text">🐾 {{ 'profile.pref_pets' | translate }}</div>
                  <div class="toggle-sub">{{ 'profile.pref_pets_desc' | translate }}</div>
                </div>
                <div class="toggle-switch" [class.on]="preferences.petsAllowed"
                     (click)="preferences.petsAllowed = !preferences.petsAllowed"></div>
              </div>

              <div class="toggle-row">
                <div>
                  <div class="toggle-text">🎵 {{ 'profile.pref_music' | translate }}</div>
                  <div class="toggle-sub">{{ 'profile.pref_music_desc' | translate }}</div>
                </div>
                <div class="toggle-switch" [class.on]="preferences.musicAllowed"
                     (click)="preferences.musicAllowed = !preferences.musicAllowed"></div>
              </div>

              <div class="m-field" style="margin-top: 16px;">
                <label class="m-label">{{ 'profile.pref_conversation' | translate }}</label>
                <div class="conversation-selector">
                  @for (level of conversationLevels; track level.value) {
                    <button type="button" class="conv-btn" [class.selected]="preferences.conversationLevel === level.value"
                            (click)="preferences.conversationLevel = level.value">
                      {{ level.labelKey | translate }}
                    </button>
                  }
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-modal secondary" (click)="closeEditProfileModal()">{{ 'common.cancel' | translate }}</button>
              <button class="btn-modal primary" (click)="savePreferences()" [disabled]="saving()">
                ✅ {{ 'common.save' | translate }}
              </button>
            </div>
          }

          <!-- TAB: Advanced -->
          @if (editProfileTab() === 'advanced') {
            <div class="modal-body">
              <p class="tab-desc">{{ 'profile.advanced_desc' | translate }}</p>

              <div class="danger-zone">
                <div class="danger-zone-title">🚨 {{ 'profile.danger_zone' | translate }}</div>
                <div class="danger-items">
                  <div class="danger-row">
                    <div>
                      <div class="danger-label">{{ 'profile.deactivate_account' | translate }}</div>
                      <div class="danger-hint">{{ 'profile.deactivate_hint' | translate }}</div>
                    </div>
                    <button class="btn-danger" (click)="deactivateAccount()">
                      {{ 'profile.deactivate_account' | translate }}
                    </button>
                  </div>
                  <hr class="danger-separator" />
                  <div class="danger-row">
                    <div>
                      <div class="danger-label">{{ 'profile.delete_account' | translate }}</div>
                      <div class="danger-hint">{{ 'profile.delete_hint' | translate }}</div>
                    </div>
                    <button class="btn-danger" (click)="deleteAccount()">
                      {{ 'profile.delete_account' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== VARIABLES ===== */
    :host {
      --eco-primary: var(--primary-green, #3CB371);
      --eco-primary-dark: var(--dark-green, #2E8B57);
      --eco-primary-light: #E8F5E9;
      --eco-primary-ultra-light: #F1F9F3;
      --eco-elec: #00B8D4;
      --eco-elec-bg: #E0F7FA;
      --eco-hybride: #7CB342;
      --eco-hybride-bg: #F1F8E9;
      --eco-gpl: #FF8F00;
      --eco-gpl-bg: #FFF8E1;
      --eco-text: #1A2E1A;
      --eco-text-light: #5F7A5F;
      --eco-text-muted: #8FA88F;
      --eco-border: #D4E8D4;
      --eco-white: #FFFFFF;
      --eco-star: #F9A825;
      --eco-shadow: 0 2px 12px rgba(60,179,113,.08);
      --eco-danger: #E53935;
      --eco-danger-bg: #FFEBEE;
      --radius: 16px;
      --radius-sm: 10px;
      display: block;
    }

    /* ===== HERO ===== */
    .profile-hero {
      background: linear-gradient(135deg, var(--eco-primary), var(--eco-primary-dark));
      padding: 36px 32px 60px;
      position: relative;
      overflow: hidden;
    }
    .profile-hero::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,.06), transparent 70%);
      border-radius: 50%;
    }
    .profile-hero-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,.2);
      border: 3px solid rgba(255,255,255,.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .profile-hero-info { flex: 1; }
    .profile-hero-info h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      margin: 0;
    }
    .profile-hero-info p {
      color: rgba(255,255,255,.75);
      font-size: .9rem;
      margin-top: 2px;
    }
    .profile-hero-badges { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .hero-badge {
      padding: 5px 14px;
      border-radius: 20px;
      font-size: .78rem;
      font-weight: 600;
      background: rgba(255,255,255,.18);
      color: #fff;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .btn-hero-edit {
      margin-left: auto;
      padding: 10px 20px;
      border-radius: 10px;
      border: 2px solid rgba(255,255,255,.35);
      background: rgba(255,255,255,.12);
      color: #fff;
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: .2s;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .btn-hero-edit:hover { background: rgba(255,255,255,.25); }

    /* ===== LAYOUT ===== */
    .profile-layout {
      max-width: 1000px;
      margin: -36px auto 0;
      padding: 0 32px 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    /* ===== CARDS ===== */
    .p-card {
      background: var(--eco-white);
      border-radius: var(--radius);
      border: 1px solid var(--eco-border);
      box-shadow: var(--eco-shadow);
      overflow: hidden;
      animation: fadeInUp .4s ease-out both;
    }
    .p-card:nth-child(2) { animation-delay: .06s; }
    .p-card:nth-child(3) { animation-delay: .12s; }
    .p-card:nth-child(4) { animation-delay: .18s; }
    .p-card-header {
      padding: 20px 24px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .p-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .icon-user { background: var(--eco-primary-light); }
    .icon-credit { background: #FFF8E1; }
    .icon-driver { background: #E3F2FD; }
    .icon-vehicle { background: var(--eco-elec-bg); }
    .p-card-title { font-weight: 700; font-size: 1.05rem; }
    .p-card-action {
      margin-left: auto;
      font-size: .82rem;
      color: var(--eco-primary);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .p-card-action:hover { text-decoration: underline; }
    .p-card-body { padding: 18px 24px 24px; }

    /* ===== INFO ROWS ===== */
    .info-rows { display: flex; flex-direction: column; gap: 14px; }
    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--eco-primary-ultra-light);
      border-radius: var(--radius-sm);
    }
    .info-row-label {
      font-size: .82rem;
      color: var(--eco-text-muted);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-row-value { font-weight: 600; font-size: .92rem; }
    .info-row-value.green { color: var(--eco-primary-dark); }

    /* Rating */
    .rating-display { display: flex; align-items: center; gap: 6px; }
    .rating-stars { color: var(--eco-star); font-size: .9rem; letter-spacing: 1px; }
    .rating-score { font-weight: 700; color: var(--eco-star); }
    .rating-count { font-size: .82rem; color: var(--eco-text-muted); }

    /* ===== CREDITS ===== */
    .credit-balance {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--eco-primary-ultra-light);
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
    }
    .credit-balance-icon { font-size: 2rem; }
    .credit-balance-amount { font-weight: 800; font-size: 1.8rem; color: var(--eco-primary-dark); }
    .credit-balance-label { font-size: .82rem; color: var(--eco-text-muted); }
    .recharge-label {
      font-size: .82rem;
      font-weight: 600;
      color: var(--eco-text-light);
      margin-bottom: 10px;
      display: block;
    }
    .credit-buttons { display: flex; gap: 10px; }
    .btn-credit {
      flex: 1;
      padding: 12px;
      border-radius: var(--radius-sm);
      border: 2px solid var(--eco-border);
      background: var(--eco-white);
      font-size: .9rem;
      font-weight: 700;
      cursor: pointer;
      transition: .2s;
      text-align: center;
      color: var(--eco-primary-dark);
    }
    .btn-credit:hover:not(:disabled) {
      border-color: var(--eco-primary);
      background: var(--eco-primary-light);
    }
    .btn-credit:disabled { opacity: .5; cursor: not-allowed; }
    .btn-credit span {
      display: block;
      font-size: .75rem;
      font-weight: 500;
      color: var(--eco-text-muted);
      margin-top: 2px;
    }

    /* ===== DRIVER STATUS ===== */
    .driver-status {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .driver-status.active {
      background: var(--eco-primary-light);
      border: 1px solid var(--eco-primary);
    }
    .driver-status.inactive {
      background: #FFF8E1;
      border: 1px solid #FFE082;
    }
    .driver-status-icon { font-size: 1.6rem; }
    .driver-status-text { flex: 1; }
    .driver-status-title { font-weight: 700; font-size: .95rem; }
    .driver-status-sub { font-size: .82rem; color: var(--eco-text-light); margin-top: 2px; }
    .btn-driver {
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      border: none;
      font-size: .85rem;
      font-weight: 600;
      cursor: pointer;
      transition: .2s;
    }
    .btn-driver.green { background: var(--eco-primary); color: #fff; }
    .btn-driver.green:hover { background: var(--eco-primary-dark); }

    /* ===== VEHICLES ===== */
    .vehicles-list { display: flex; flex-direction: column; gap: 12px; }
    .vehicle-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--eco-border);
      transition: .2s;
      background: var(--eco-white);
    }
    .vehicle-card:hover {
      border-color: var(--eco-primary);
      box-shadow: var(--eco-shadow);
    }
    .v-energy-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      flex-shrink: 0;
    }
    .v-energy-badge.elec { background: var(--eco-elec-bg); color: #00838F; }
    .v-energy-badge.hybride { background: var(--eco-hybride-bg); color: #558B2F; }
    .v-energy-badge.gpl { background: var(--eco-gpl-bg); color: #E65100; }
    .v-energy-icon { font-size: 1.2rem; }
    .v-energy-label { font-size: .55rem; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
    .v-info { flex: 1; }
    .v-name { font-weight: 700; font-size: .95rem; }
    .v-meta { font-size: .82rem; color: var(--eco-text-light); margin-top: 2px; }
    .v-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: .72rem;
      font-weight: 600;
      margin-top: 4px;
    }
    .v-tag.elec { background: var(--eco-elec-bg); color: #00838F; }
    .v-tag.hybride { background: var(--eco-hybride-bg); color: #558B2F; }
    .v-tag.gpl { background: var(--eco-gpl-bg); color: #E65100; }
    .v-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .v-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1.5px solid var(--eco-border);
      background: var(--eco-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: .9rem;
      transition: .15s;
    }
    .v-btn:hover {
      border-color: var(--eco-primary);
      background: var(--eco-primary-ultra-light);
    }
    .v-btn.danger:hover {
      border-color: var(--eco-danger);
      background: var(--eco-danger-bg);
    }
    .v-btn:disabled { opacity: .4; cursor: not-allowed; }
    .btn-add-vehicle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      border: 2px dashed var(--eco-border);
      border-radius: var(--radius-sm);
      background: transparent;
      cursor: pointer;
      font-size: .88rem;
      font-weight: 600;
      color: var(--eco-primary);
      transition: .2s;
      width: 100%;
    }
    .btn-add-vehicle:hover {
      border-color: var(--eco-primary);
      background: var(--eco-primary-ultra-light);
    }
    .empty-state {
      color: var(--eco-text-muted);
      font-style: italic;
      text-align: center;
      padding: 1rem 0;
    }

    /* ===== MODAL BASE ===== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,46,26,.45);
      backdrop-filter: blur(4px);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: var(--eco-white);
      border-radius: var(--radius);
      box-shadow: 0 20px 60px rgba(0,0,0,.2);
      width: min(520px, 92vw);
      max-height: 90vh;
      overflow-y: auto;
      z-index: 310;
    }
    .modal-large { width: min(620px, 94vw); }
    .modal-body { padding: 20px 24px; }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--eco-border);
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .modal-footer-green {
      padding: 18px 28px;
      border-top: 1px solid var(--eco-border);
      background: var(--eco-primary-ultra-light);
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    /* Modal header variants */
    .modal-header-vehicle {
      background: linear-gradient(135deg, var(--eco-elec-bg), #B2EBF2);
      padding: 24px 28px;
      border-radius: var(--radius) var(--radius) 0 0;
    }
    .modal-header-driver {
      background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
      padding: 24px 28px;
      border-radius: var(--radius) var(--radius) 0 0;
    }
    .modal-header-flat {
      padding: 20px 24px;
      border-bottom: 1px solid var(--eco-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .modal-header-inner {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .modal-header-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: var(--eco-white);
      box-shadow: 0 4px 12px rgba(0,0,0,.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .modal-header-flat .modal-header-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      box-shadow: none;
      font-size: 1.2rem;
    }
    .profile-icon-box { background: var(--eco-primary-light); }
    .modal-header-text { flex: 1; }
    .modal-title { font-weight: 700; font-size: 1.1rem; }
    .modal-header-inner .modal-title { font-size: 1.2rem; }
    .modal-subtitle { font-size: .82rem; color: var(--eco-text-light); margin-top: 2px; }
    .modal-close-btn {
      background: var(--eco-white);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      cursor: pointer;
      color: var(--eco-text-muted);
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      transition: .15s;
      margin-left: auto;
    }
    .modal-close-btn:hover {
      background: var(--eco-primary-light);
      color: var(--eco-text);
    }

    /* ===== MODAL FORM ELEMENTS ===== */
    .m-field { margin-bottom: 16px; }
    .m-field:last-child { margin-bottom: 0; }
    .m-label {
      font-size: .8rem;
      font-weight: 600;
      color: var(--eco-text-light);
      margin-bottom: 5px;
      display: block;
    }
    .m-label .required { color: var(--eco-primary); }
    .m-input {
      border: 1.5px solid var(--eco-border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      font-size: .9rem;
      color: var(--eco-text);
      background: var(--eco-white);
      transition: .2s;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .m-input:focus {
      border-color: var(--eco-primary);
      box-shadow: 0 0 0 3px var(--eco-primary-light);
    }
    select.m-input {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235F7A5F' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    .m-input.disabled { background: #f5f5f5; color: #999; cursor: not-allowed; }
    .m-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .m-hint { font-size: .75rem; color: var(--eco-text-muted); margin-top: 3px; }
    .separator { height: 1px; background: var(--eco-border); margin: 20px 0; }

    /* ===== VEHICLE MODAL: ENERGY SELECTOR ===== */
    .energy-select { display: flex; gap: 10px; margin-top: 10px; }
    .energy-opt {
      flex: 1;
      padding: 16px 10px;
      border-radius: 14px;
      border: 2px solid var(--eco-border);
      cursor: pointer;
      text-align: center;
      transition: .25s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .energy-opt:hover {
      border-color: var(--eco-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,.06);
    }
    .energy-opt.selected {
      border-width: 2.5px;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,.08);
    }
    .energy-opt.selected.elec { border-color: var(--eco-elec); background: var(--eco-elec-bg); }
    .energy-opt.selected.hybride { border-color: var(--eco-hybride); background: var(--eco-hybride-bg); }
    .energy-opt.selected.gpl { border-color: var(--eco-gpl); background: var(--eco-gpl-bg); }
    .energy-opt-circle {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 4px;
    }
    .energy-opt-label { font-size: .82rem; font-weight: 700; }
    .energy-opt-emission { font-size: .7rem; color: var(--eco-text-muted); }

    /* Seats selector */
    .seats-selector { display: flex; gap: 8px; }
    .place-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 2px solid var(--eco-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: var(--eco-text-muted);
      cursor: pointer;
      transition: .2s;
      background: var(--eco-white);
    }
    .place-btn:hover { border-color: var(--eco-primary); color: var(--eco-primary); }
    .place-btn.active {
      border-color: var(--eco-primary);
      background: var(--eco-primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(60,179,113,.25);
    }

    /* License plate */
    .plate-wrapper {
      max-width: 240px;
      background: var(--eco-white);
      border: 3px solid var(--eco-text);
      border-radius: 8px;
      padding: 3px;
      position: relative;
    }
    .plate-strip {
      background: linear-gradient(to bottom, #003399, #003399);
      width: 28px;
      position: absolute;
      left: 3px;
      top: 3px;
      bottom: 3px;
      border-radius: 4px 0 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .plate-strip span { color: #fff; font-size: .55rem; font-weight: 700; }
    .m-plaque {
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-align: center;
      border: none !important;
      padding: 10px 14px 10px 40px !important;
      font-size: 1.1rem;
      background: transparent !important;
    }
    .m-plaque:focus { box-shadow: none !important; }

    /* ===== DRIVER MODAL ===== */
    .pledge-card {
      border-radius: 14px;
      border: 1.5px solid var(--eco-border);
      overflow: hidden;
    }
    .pledge-card-header {
      background: var(--eco-primary-ultra-light);
      padding: 16px 20px;
      border-bottom: 1px solid var(--eco-border);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
    }
    .pledge-card-title { font-weight: 700; font-size: .95rem; }
    .pledge-card-body { padding: 20px; }
    .pledge-intro {
      font-size: .88rem;
      color: var(--eco-text-light);
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .driver-confirm-check {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1.5px solid var(--eco-border);
      cursor: pointer;
      transition: .2s;
      margin-bottom: 10px;
    }
    .driver-confirm-check.checked {
      border-color: var(--eco-primary);
      background: var(--eco-primary-ultra-light);
    }
    .driver-check-box {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      border: 2.5px solid var(--eco-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: .2s;
      margin-top: 1px;
    }
    .driver-confirm-check.checked .driver-check-box {
      border-color: var(--eco-primary);
      background: var(--eco-primary);
    }
    .check-icon { color: #fff; font-size: .7rem; font-weight: 700; }
    .check-title { font-weight: 700; font-size: .92rem; display: flex; align-items: center; gap: 8px; }
    .check-desc { font-size: .82rem; color: var(--eco-text-light); margin-top: 3px; }
    .pledge-warning {
      padding: 12px 16px;
      background: #FFF8E1;
      border-radius: 10px;
      border: 1px solid #FFE082;
      font-size: .8rem;
      color: #BF360C;
      line-height: 1.5;
      margin-top: 8px;
    }

    /* ===== PROFILE MODAL: TABS ===== */
    .modal-tabs {
      display: flex;
      gap: 0;
      border-bottom: 2px solid var(--eco-border);
      padding: 0 24px;
    }
    .modal-tab {
      padding: 12px 20px;
      font-size: .88rem;
      font-weight: 600;
      color: var(--eco-text-muted);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: .2s;
    }
    .modal-tab:hover { color: var(--eco-text); }
    .modal-tab.active {
      color: var(--eco-primary-dark);
      border-bottom-color: var(--eco-primary);
    }
    .tab-desc {
      font-size: .88rem;
      color: var(--eco-text-light);
      margin-bottom: 18px;
    }

    /* Avatar section */
    .avatar-upload {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 16px;
      background: var(--eco-primary-ultra-light);
      border-radius: var(--radius-sm);
    }
    .avatar-preview {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--eco-primary-light), var(--eco-primary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }
    .avatar-upload-info { flex: 1; }
    .avatar-upload-title { font-weight: 700; font-size: .92rem; margin-bottom: 4px; }
    .avatar-upload-hint { font-size: .78rem; color: var(--eco-text-muted); }

    /* ===== PASSWORD STRENGTH ===== */
    .pwd-strength { display: flex; gap: 4px; margin-top: 6px; }
    .pwd-bar {
      height: 4px;
      flex: 1;
      border-radius: 2px;
      background: var(--eco-border);
      transition: .3s;
    }
    .pwd-bar.weak { background: #E53935; }
    .pwd-bar.medium { background: #FF8F00; }
    .pwd-bar.strong { background: var(--eco-primary); }
    .pwd-label { font-size: .75rem; margin-top: 4px; }

    /* ===== TOGGLE SWITCHES ===== */
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: var(--eco-primary-ultra-light);
      border-radius: var(--radius-sm);
      margin-bottom: 10px;
    }
    .toggle-row:last-of-type { margin-bottom: 0; }
    .toggle-text { font-size: .88rem; font-weight: 500; }
    .toggle-sub { font-size: .78rem; color: var(--eco-text-muted); }
    .toggle-switch {
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: var(--eco-border);
      cursor: pointer;
      position: relative;
      transition: .25s;
      flex-shrink: 0;
    }
    .toggle-switch.on { background: var(--eco-primary); }
    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      transition: .25s;
      box-shadow: 0 1px 3px rgba(0,0,0,.15);
    }
    .toggle-switch.on::after { left: 23px; }

    /* Conversation level */
    .conversation-selector { display: flex; gap: 8px; }
    .conv-btn {
      flex: 1;
      padding: 10px;
      border: 2px solid var(--eco-border);
      border-radius: var(--radius-sm);
      background: var(--eco-white);
      cursor: pointer;
      font-weight: 600;
      font-size: .85rem;
      transition: .2s;
    }
    .conv-btn:hover { border-color: var(--eco-primary); }
    .conv-btn.selected {
      background: var(--eco-primary);
      color: #fff;
      border-color: var(--eco-primary);
    }

    /* ===== DANGER ZONE ===== */
    .danger-zone {
      border: 2px solid #FFCDD2;
      border-radius: var(--radius-sm);
      padding: 16px;
      background: #FFF5F5;
      margin-top: 8px;
    }
    .danger-zone-title {
      font-weight: 700;
      font-size: .88rem;
      color: var(--eco-danger);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .danger-items { display: flex; flex-direction: column; gap: 10px; }
    .danger-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .danger-label { font-weight: 600; font-size: .88rem; }
    .danger-hint { font-size: .78rem; color: var(--eco-text-muted); }
    .danger-separator { border: none; border-top: 1px solid #FFCDD2; }
    .btn-danger {
      padding: 8px 18px;
      border-radius: 8px;
      border: 1.5px solid var(--eco-danger);
      background: transparent;
      color: var(--eco-danger);
      font-size: .82rem;
      font-weight: 600;
      cursor: pointer;
      transition: .2s;
      white-space: nowrap;
    }
    .btn-danger:hover { background: var(--eco-danger); color: #fff; }

    /* ===== BUTTONS ===== */
    .btn-modal {
      padding: 10px 24px;
      border-radius: var(--radius-sm);
      font-size: .9rem;
      font-weight: 600;
      cursor: pointer;
      transition: .2s;
      border: none;
    }
    .btn-modal.primary { background: var(--eco-primary); color: #fff; }
    .btn-modal.primary:hover { background: var(--eco-primary-dark); }
    .btn-modal.primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-modal.secondary {
      background: transparent;
      border: 2px solid var(--eco-border);
      color: var(--eco-text-light);
    }
    .btn-modal.secondary:hover {
      border-color: var(--eco-primary);
      color: var(--eco-primary);
    }
    .modal-footer-green .btn-modal.primary {
      padding: 12px 32px;
      border-radius: 12px;
      font-size: .95rem;
    }

    /* ===== ANIMATIONS ===== */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 700px) {
      .profile-hero-inner { flex-direction: column; text-align: center; }
      .profile-hero-badges { justify-content: center; }
      .btn-hero-edit { margin-left: 0; }
      .profile-layout { grid-template-columns: 1fr; padding: 0 16px 32px; }
      .modal, .modal-large { width: 100%; max-width: 100%; border-radius: 0; }
      .energy-select { flex-direction: column; }
      .m-row { grid-template-columns: 1fr; }
      .credit-buttons { flex-wrap: wrap; }
      .danger-row { flex-direction: column; align-items: flex-start; }
      .modal-tabs { overflow-x: auto; }
      .modal-tab { padding: 12px 14px; font-size: .82rem; white-space: nowrap; }
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
  strengthBars = [0, 1, 2, 3];

  vehicleColors = ['black', 'white', 'gray', 'silver', 'red', 'blue', 'green', 'brown', 'beige', 'other'];

  energyTypes = [
    { value: 'Electric', icon: '\u26A1', labelKey: 'vehicle.types.electric', emissionKey: 'vehicle.emission.electric', cssClass: 'elec', bgColor: 'rgba(0,184,212,.12)' },
    { value: 'Hybrid', icon: '\uD83D\uDD0B', labelKey: 'vehicle.types.hybrid', emissionKey: 'vehicle.emission.hybrid', cssClass: 'hybride', bgColor: 'rgba(124,179,66,.12)' },
    { value: 'LPG', icon: '\uD83C\uDF3F', labelKey: 'vehicle.types.lpg', emissionKey: 'vehicle.emission.lpg', cssClass: 'gpl', bgColor: 'rgba(255,143,0,.12)' },
  ];

  conversationLevels = [
    { value: 'quiet' as const, labelKey: 'profile.pref_quiet' },
    { value: 'moderate' as const, labelKey: 'profile.pref_moderate' },
    { value: 'chatty' as const, labelKey: 'profile.pref_chatty' },
  ];

  private energyClassMap: Record<string, string> = { Electric: 'elec', Hybrid: 'hybride', LPG: 'gpl' };
  private energyAbbrMap: Record<string, string> = { Electric: 'vehicle.short.electric', Hybrid: 'vehicle.short.hybrid', LPG: 'vehicle.short.lpg' };
  private emissionMap: Record<string, string> = { Electric: 'vehicle.emission.electric', Hybrid: 'vehicle.emission.hybrid', LPG: 'vehicle.emission.lpg' };
  private roleIconMap: Record<string, string> = { Passenger: '\uD83C\uDFAB', Driver: '\uD83D\uDE97', Employee: '\uD83D\uDCBC', Administrator: '\uD83D\uDEE1\uFE0F' };

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

  getEnergyTypeClass(type: string): string {
    return this.energyClassMap[type] ?? 'elec';
  }

  getEnergyAbbr(type: string): string {
    const key = this.energyAbbrMap[type];
    return key ? this.translate.instant(key) : type;
  }

  getEnergyShortLabel(type: string): string {
    const key = this.energyTypes.find(e => e.value === type)?.labelKey;
    return key ? this.translate.instant(key) : type;
  }

  getEmissionLabel(type: string): string {
    const key = this.emissionMap[type];
    return key ? this.translate.instant(key) : '';
  }

  getRoleIcon(role: string): string {
    return this.roleIconMap[role] ?? '';
  }

  getTranslatedRoles(): string {
    return (this.user()?.roles ?? []).map(r => this.translate.instant('admin.roles.' + r)).join(', ');
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

  getPasswordStrengthScore(): number {
    const pwd = this.passwordForm.newPassword;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
  }

  getPasswordStrengthLevel(): string {
    const score = this.getPasswordStrengthScore();
    if (score <= 1) return 'weak';
    if (score <= 2) return 'medium';
    if (score <= 3) return 'good';
    return 'excellent';
  }

  getPasswordBarClass(): string {
    const score = this.getPasswordStrengthScore();
    if (score <= 1) return 'weak';
    if (score <= 2) return 'medium';
    return 'strong';
  }

  getPasswordLabelColor(): string {
    const score = this.getPasswordStrengthScore();
    if (score <= 1) return '#E53935';
    if (score <= 2) return '#FF8F00';
    return 'var(--eco-primary)';
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
