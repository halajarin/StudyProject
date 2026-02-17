import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarpoolService } from '../../../services/carpool.service';
import { UserService } from '../../../services/user.service';
import { Vehicle } from '../../../models/vehicle.model';
import { CreateCarpoolForm } from '../../../interfaces/carpool-form.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getEnergyIcon as energyIcon } from '../../../utils/energy.utils';

@Component({
  selector: 'app-create-carpool',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <!-- ===== PAGE HERO ===== -->
    <div class="page-hero">
      <div class="page-hero-inner">
        <h1>&#128663; {{ 'carpool.create_title' | translate }}</h1>
        <p>{{ 'create_carpool.page_subtitle' | translate }}</p>
      </div>
    </div>

    <!-- ===== STEPPER ===== -->
    <div class="stepper">
      @for (step of steps; track step.num; let i = $index) {
        <div class="step" [class.active]="currentStep() === step.num" [class.done]="currentStep() > step.num">
          @if (!$last) { <div class="step-line"></div> }
          <div class="step-dot">
            @if (currentStep() > step.num) { &#10003; } @else { {{ step.num }} }
          </div>
          <div class="step-label">{{ step.labelKey | translate }}</div>
        </div>
      }
    </div>

    <!-- ===== FORM ===== -->
    <div class="form-container">
      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }
      @if (success()) {
        <div class="alert alert-success">{{ success() }}</div>
      }

      <form (ngSubmit)="createTrip()">
        <!-- ── 1. ITINÉRAIRE ── -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon route">&#128205;</div>
            <div class="section-title">{{ 'create_carpool.route_title' | translate }}</div>
            <div class="section-subtitle">{{ 'create_carpool.step_of' | translate:{current: 1, total: 5} }}</div>
          </div>
          <div class="section-body">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">{{ 'carpool.departure_city' | translate }} <span class="required">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-input-icon">&#128205;</span>
                  <input class="field-input has-icon" type="text"
                         [(ngModel)]="trip.departureCity" name="departureCity"
                         [placeholder]="'home.placeholder_departure' | translate"
                         (ngModelChange)="updateStepper()" required>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.departure_location' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="text"
                       [(ngModel)]="trip.departureLocation" name="departureLocation"
                       [placeholder]="'carpool.placeholder_departure_location' | translate"
                       (ngModelChange)="updateStepper()" required>
              </div>
            </div>
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">{{ 'carpool.arrival_city' | translate }} <span class="required">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-input-icon">&#128204;</span>
                  <input class="field-input has-icon" type="text"
                         [(ngModel)]="trip.arrivalCity" name="arrivalCity"
                         [placeholder]="'home.placeholder_arrival' | translate"
                         (ngModelChange)="updateStepper()" required>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.arrival_location' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="text"
                       [(ngModel)]="trip.arrivalLocation" name="arrivalLocation"
                       [placeholder]="'carpool.placeholder_arrival_location' | translate"
                       (ngModelChange)="updateStepper()" required>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 2. HORAIRES & TARIF ── -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon time">&#128336;</div>
            <div class="section-title">{{ 'create_carpool.schedule_title' | translate }}</div>
            <div class="section-subtitle">{{ 'create_carpool.step_of' | translate:{current: 2, total: 5} }}</div>
          </div>
          <div class="section-body">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">{{ 'carpool.departure_date' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="date"
                       [(ngModel)]="trip.departureDate" name="departureDate"
                       (ngModelChange)="calculateDuration(); updateStepper()" required>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.departure_time' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="time"
                       [(ngModel)]="trip.departureTime" name="departureTime"
                       (ngModelChange)="calculateDuration(); updateStepper()" required>
              </div>
            </div>
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">{{ 'carpool.arrival_date' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="date"
                       [(ngModel)]="trip.arrivalDate" name="arrivalDate"
                       (ngModelChange)="calculateDuration(); updateStepper()" required>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.arrival_time' | translate }} <span class="required">*</span></label>
                <input class="field-input" type="time"
                       [(ngModel)]="trip.arrivalTime" name="arrivalTime"
                       (ngModelChange)="calculateDuration(); updateStepper()" required>
              </div>
            </div>
            <div class="field-row triple">
              <div class="field-group">
                <label class="field-label">{{ 'carpool.number_of_seats' | translate }} <span class="required">*</span></label>
                <select class="field-input" [(ngModel)]="trip.totalSeats" name="totalSeats"
                        (ngModelChange)="updateStepper()" required>
                  @for (n of [1,2,3,4]; track n) {
                    <option [ngValue]="n">{{ 'create_carpool.seats_option' | translate:{count: n} }}</option>
                  }
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.price_per_person' | translate }} <span class="required">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-input-icon">&#129689;</span>
                  <input class="field-input has-icon" type="number" min="2"
                         [(ngModel)]="trip.pricePerPerson" name="pricePerPerson"
                         (ngModelChange)="updateStepper()" required>
                </div>
                <span class="field-hint">{{ 'carpool.platform_commission' | translate }}</span>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'carpool.estimated_duration' | translate }}</label>
                <div class="duration-computed">
                  <span class="duration-icon">&#9201;&#65039;</span>
                  <span class="duration-text" [innerHTML]="durationDisplay()"></span>
                </div>
                <span class="field-hint">{{ 'carpool.duration_auto_calculated' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 3. VÉHICULE ── -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon vehicle">&#128663;</div>
            <div class="section-title">{{ 'create_carpool.vehicle_title' | translate }}</div>
            <div class="section-subtitle">{{ 'create_carpool.step_of' | translate:{current: 3, total: 5} }}</div>
          </div>
          <div class="section-body">
            <label class="field-label vehicle-select-label">
              {{ 'create_carpool.select_vehicle_label' | translate }} <span class="required">*</span>
            </label>
            <div class="vehicle-options">
              @for (v of vehicles(); track v.vehicleId) {
                <div class="vehicle-option" [class.selected]="trip.vehicleId === v.vehicleId"
                     (click)="selectVehicle(v.vehicleId)">
                  <div class="vehicle-option-radio"></div>
                  <div class="vehicle-energy-badge-sm" [ngClass]="getEnergyBadgeClass(v.energyType)">
                    <span>{{ getEnergyIcon(v.energyType) }}</span>
                    <span class="vehicle-energy-label-sm">{{ getEnergyShortLabel(v.energyType) }}</span>
                  </div>
                  <div class="vehicle-option-info">
                    <div class="vehicle-option-name">{{ v.brandLabel }} {{ v.model }}</div>
                    <div class="vehicle-option-meta">
                      {{ v.color }}
                      @if (v.firstRegistrationDate) {
                        &middot; {{ v.firstRegistrationDate | date:'yyyy' }}
                      }
                      &middot; {{ v.seatCount }} {{ 'carpool.seats_available' | translate }}
                    </div>
                    <span class="vehicle-option-tag" [ngClass]="getEnergyBadgeClass(v.energyType)">
                      {{ getEnergyIcon(v.energyType) }} {{ getEnergyLabel(v.energyType) }} — {{ getEmissionLabel(v.energyType) }}
                    </span>
                  </div>
                </div>
              }
              @if (vehicles().length === 0) {
                <div class="alert alert-danger" style="margin:0;">{{ 'carpool.must_add_vehicle' | translate }}</div>
              }
              <p class="vehicle-manage-text">
                {{ 'create_carpool.vehicle_manage_link' | translate }}
                <a routerLink="/profile">{{ 'create_carpool.vehicle_manage_link_text' | translate }}</a>.
              </p>
            </div>
          </div>
        </div>

        <!-- ── 4. ARRÊTS & RECHARGE ── -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon charge">&#128268;</div>
            <div class="section-title">{{ 'create_carpool.stops_title' | translate }}</div>
            <div class="section-subtitle">{{ 'create_carpool.step_of' | translate:{current: 4, total: 5} }} · {{ 'create_carpool.optional' | translate }}</div>
          </div>
          <div class="section-body">
            <p class="stops-description">{{ 'create_carpool.stops_subtitle' | translate }}</p>
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">{{ 'create_carpool.stops_count_label' | translate }}</label>
                <select class="field-input" [(ngModel)]="trip.pausesCount" name="pausesCount"
                        (ngModelChange)="onPausesCountChange()">
                  <option [ngValue]="0">{{ 'create_carpool.stops_option_0' | translate }}</option>
                  <option [ngValue]="1">{{ 'create_carpool.stops_option_1' | translate }}</option>
                  <option [ngValue]="2">{{ 'create_carpool.stops_option_2' | translate }}</option>
                  <option [ngValue]="3">{{ 'create_carpool.stops_option_3' | translate }}</option>
                  <option [ngValue]="4">{{ 'create_carpool.stops_option_4' | translate }}</option>
                  <option [ngValue]="5">{{ 'create_carpool.stops_option_5' | translate }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">{{ 'create_carpool.stops_duration_label' | translate }}</label>
                <div class="field-input-wrap">
                  <span class="field-input-icon">&#9201;&#65039;</span>
                  <input class="field-input has-icon" type="number" min="0"
                         [(ngModel)]="trip.pausesDurationMinutes" name="pausesDurationMinutes"
                         [placeholder]="'create_carpool.stops_duration_placeholder' | translate">
                </div>
                <span class="field-hint">{{ 'create_carpool.stops_duration_hint' | translate }}</span>
              </div>
            </div>
            @if (trip.pausesCount && trip.pausesCount > 0) {
              <div class="recharge-summary">
                <span class="recharge-summary-icon">&#128268;</span>
                <span class="recharge-summary-text">
                  <span [innerHTML]="'create_carpool.stops_summary' | translate:{count: trip.pausesCount, duration: trip.pausesDurationMinutes || 0}"></span>
                  <br><span class="recharge-summary-sub">{{ 'create_carpool.stops_summary_hint' | translate }}</span>
                </span>
              </div>
            }
          </div>
        </div>

        <!-- ── 5. CONFIRMATION ── -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon confirm">&#9989;</div>
            <div class="section-title">{{ 'create_carpool.confirm_title' | translate }}</div>
            <div class="section-subtitle">{{ 'create_carpool.step_of' | translate:{current: 5, total: 5} }}</div>
          </div>
          <div class="section-body">
            <div class="confirm-box">
              <div class="confirm-title">&#9888;&#65039; {{ 'create_carpool.confirm_box_title' | translate }}</div>
              <label class="confirm-check" [class.checked]="confirmed">
                <input type="checkbox" [(ngModel)]="confirmed" name="confirmed" hidden>
                <div class="confirm-checkbox">
                  @if (confirmed) { &#10003; }
                </div>
                <div class="confirm-text" [innerHTML]="'create_carpool.confirm_text' | translate"></div>
              </label>
            </div>

            <div class="preview-note">
              <span class="preview-note-icon">&#128065;&#65039;</span>
              {{ 'create_carpool.preview_note' | translate }}
            </div>

            <div class="submit-area">
              <button type="submit" class="btn-submit" [disabled]="!canSubmit()">
                @if (loading()) {
                  {{ 'carpool.creating' | translate }}
                } @else {
                  &#128640; {{ 'create_carpool.publish' | translate }}
                }
              </button>
              <button type="button" class="btn-draft">
                &#128190; {{ 'create_carpool.save_draft' | translate }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* ===== PAGE HERO ===== */
    .page-hero {
      background: linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 100%);
      padding: 32px 32px 28px;
      position: relative;
      overflow: hidden;
      margin: -20px -20px 0;
    }
    .page-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -15%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
      border-radius: 50%;
    }
    .page-hero-inner {
      max-width: 820px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .page-hero h1 {
      color: white;
      font-size: 1.7rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .page-hero p {
      color: rgba(255,255,255,0.8);
      font-size: 0.95rem;
      margin: 0;
    }

    /* ===== STEPPER ===== */
    .stepper {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px 32px 0;
      display: flex;
    }
    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .step-line {
      position: absolute;
      top: 16px;
      left: 50%;
      right: -50%;
      height: 3px;
      background: var(--light-gray);
      z-index: 0;
    }
    .step.done .step-line { background: var(--primary-green); }
    .step-dot {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: white;
      border: 3px solid var(--light-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--gray);
      position: relative;
      z-index: 1;
      transition: 0.3s;
    }
    .step.active .step-dot {
      border-color: var(--primary-green);
      background: var(--primary-green);
      color: white;
      box-shadow: 0 0 0 5px rgba(46,204,113,0.15);
    }
    .step.done .step-dot {
      border-color: var(--primary-green);
      background: var(--primary-green);
      color: white;
    }
    .step-label {
      margin-top: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--gray);
      text-align: center;
    }
    .step.active .step-label, .step.done .step-label {
      color: var(--dark-green);
    }

    /* ===== FORM CONTAINER ===== */
    .form-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px 32px 48px;
    }

    /* ===== ALERTS ===== */
    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.9rem;
      margin-bottom: 16px;
    }
    .alert-danger {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }
    .alert-success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }

    /* ===== FORM SECTIONS ===== */
    .form-section {
      background: white;
      border-radius: 16px;
      border: 1px solid var(--light-gray);
      box-shadow: 0 2px 12px rgba(46,204,113,0.08);
      margin-bottom: 20px;
      overflow: hidden;
      animation: fadeInUp 0.4s ease-out both;
    }
    .form-section:nth-child(2) { animation-delay: 0.06s; }
    .form-section:nth-child(3) { animation-delay: 0.12s; }
    .form-section:nth-child(4) { animation-delay: 0.18s; }
    .form-section:nth-child(5) { animation-delay: 0.24s; }
    .form-section:nth-child(6) { animation-delay: 0.30s; }

    .section-header {
      padding: 20px 24px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .section-icon.route { background: #e8f5e9; }
    .section-icon.time { background: #e3f2fd; }
    .section-icon.vehicle { background: #e0f7fa; }
    .section-icon.charge { background: #FFF8E1; }
    .section-icon.confirm { background: #ffebee; }
    .section-title { font-weight: 700; font-size: 1.05rem; }
    .section-subtitle { font-size: 0.82rem; color: var(--gray); margin-left: auto; }
    .section-body { padding: 18px 24px 24px; }

    /* ===== FORM FIELDS ===== */
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .field-row.triple { grid-template-columns: 1fr 1fr 1fr; }
    .field-row:last-child { margin-bottom: 0; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--gray); }
    .field-label .required { color: var(--primary-green); margin-left: 2px; }
    .field-hint { font-size: 0.75rem; color: var(--gray); margin-top: 2px; }

    .field-input {
      border: 1.5px solid var(--light-gray);
      border-radius: 10px;
      padding: 12px 14px;
      font-family: inherit;
      font-size: 0.9rem;
      color: var(--black);
      background: white;
      transition: 0.2s;
      outline: none;
      width: 100%;
      margin: 0;
      box-shadow: none;
    }
    .field-input:focus {
      border-color: var(--primary-green);
      box-shadow: 0 0 0 3px rgba(46,204,113,0.15);
    }
    .field-input::placeholder { color: var(--gray); }
    select.field-input {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237f8c8d' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    .field-input-wrap { position: relative; }
    .field-input.has-icon { padding-left: 40px; }
    .field-input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      pointer-events: none;
    }

    /* ===== DURATION COMPUTED ===== */
    .duration-computed {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--very-light-green);
      border-radius: 10px;
      border: 1px solid var(--light-gray);
      min-height: 46px;
    }
    .duration-icon { font-size: 1.2rem; }
    .duration-text { font-size: 0.88rem; color: var(--gray); }

    /* ===== VEHICLE SELECTOR ===== */
    .vehicle-select-label { margin-bottom: 12px; }
    .vehicle-options { display: flex; flex-direction: column; gap: 10px; }
    .vehicle-option {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: 10px;
      border: 2px solid var(--light-gray);
      cursor: pointer;
      transition: 0.2s;
    }
    .vehicle-option:hover {
      border-color: var(--primary-green);
      background: #f1f9f3;
    }
    .vehicle-option.selected {
      border-color: var(--primary-green);
      background: #e8f5e9;
    }
    .vehicle-option-radio {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2.5px solid var(--light-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: 0.2s;
    }
    .vehicle-option.selected .vehicle-option-radio { border-color: var(--primary-green); }
    .vehicle-option.selected .vehicle-option-radio::after {
      content: '';
      width: 10px;
      height: 10px;
      background: var(--primary-green);
      border-radius: 50%;
    }
    .vehicle-energy-badge-sm {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      flex-shrink: 0;
      font-size: 1.1rem;
    }
    .vehicle-energy-badge-sm.elec { background: #e0f7fa; color: #00838f; }
    .vehicle-energy-badge-sm.hybride { background: #f1f8e9; color: #558b2f; }
    .vehicle-energy-badge-sm.gpl { background: #fff8e1; color: #e65100; }
    .vehicle-energy-label-sm {
      font-size: 0.55rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .vehicle-option-info { flex: 1; }
    .vehicle-option-name { font-weight: 700; font-size: 0.95rem; }
    .vehicle-option-meta { font-size: 0.82rem; color: var(--gray); margin-top: 1px; }
    .vehicle-option-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 600;
      margin-top: 4px;
    }
    .vehicle-option-tag.elec { background: #e0f7fa; color: #00838f; }
    .vehicle-option-tag.hybride { background: #f1f8e9; color: #558b2f; }
    .vehicle-option-tag.gpl { background: #fff8e1; color: #e65100; }
    .vehicle-manage-text {
      font-size: 0.82rem;
      color: var(--gray);
      margin-top: 8px;
    }
    .vehicle-manage-text a {
      color: var(--primary-green);
      font-weight: 600;
      text-decoration: none;
    }
    .vehicle-manage-text a:hover { text-decoration: underline; }

    /* ===== STOPS & RECHARGE ===== */
    .stops-description {
      font-size: 0.88rem;
      color: var(--gray);
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .recharge-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #FFF8E1;
      border-radius: 10px;
      border: 1px solid #FFE082;
      margin-top: 12px;
    }
    .recharge-summary-icon {
      font-size: 1.4rem;
    }
    .recharge-summary-text {
      font-size: 0.88rem;
      color: #E65100;
    }
    .recharge-summary-text strong {
      color: #BF360C;
    }
    .recharge-summary-sub {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    /* ===== CONFIRMATION ===== */
    .confirm-box {
      background: #fff8e1;
      border: 2px solid #ffe082;
      border-radius: 10px;
      padding: 18px 20px;
    }
    .confirm-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #e65100;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .confirm-check {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
    }
    .confirm-checkbox {
      width: 22px;
      height: 22px;
      border: 2.5px solid #ffb74d;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: 0.2s;
      margin-top: 2px;
      font-size: 0.8rem;
      color: white;
    }
    .confirm-check.checked .confirm-checkbox {
      background: var(--primary-green);
      border-color: var(--primary-green);
    }
    .confirm-text {
      font-size: 0.88rem;
      color: #5d4037;
      line-height: 1.5;
    }
    .preview-note {
      background: #f1f9f3;
      border: 1px solid var(--light-gray);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--gray);
      margin-top: 16px;
    }
    .preview-note-icon { font-size: 1.2rem; }

    /* ===== SUBMIT ===== */
    .submit-area { margin-top: 20px; display: flex; align-items: center; gap: 12px; }
    .btn-submit {
      padding: 16px 40px;
      background: var(--primary-green);
      color: white;
      border: none;
      border-radius: 14px;
      font-family: inherit;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: 0.25s;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 16px rgba(46,204,113,0.25);
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--dark-green);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(46,204,113,0.35);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .btn-draft {
      padding: 16px 28px;
      background: transparent;
      border: 2px solid var(--light-gray);
      border-radius: 14px;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--gray);
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-draft:hover {
      border-color: var(--primary-green);
      color: var(--primary-green);
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 700px) {
      .page-hero { padding: 24px 16px 20px; }
      .page-hero h1 { font-size: 1.3rem; }
      .stepper { padding: 16px 16px 0; }
      .step-label { font-size: 0.7rem; }
      .form-container { padding: 16px; }
      .field-row, .field-row.triple { grid-template-columns: 1fr; }
      .section-body { padding: 14px 16px 18px; }
      .section-header { padding: 16px 16px 0; }
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
    estimatedDurationMinutes: undefined,
    pausesCount: 0,
    pausesDurationMinutes: 0
  };

  vehicles = signal<Vehicle[]>([]);
  error = signal('');
  success = signal('');
  loading = signal(false);
  confirmed = false;

  // Stepper
  currentStep = signal(1);
  steps = [
    { num: 1, labelKey: 'create_carpool.step_route' },
    { num: 2, labelKey: 'create_carpool.step_schedule' },
    { num: 3, labelKey: 'create_carpool.step_vehicle' },
    { num: 4, labelKey: 'create_carpool.step_stops' },
    { num: 5, labelKey: 'create_carpool.step_confirm' },
  ];

  // Duration display
  durationDisplay = signal('');

  constructor(
    private carpoolService: CarpoolService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.durationDisplay.set(this.translate.instant('create_carpool.duration_fill_times'));
    this.loadVehicles();
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        if (data.length === 0) {
          this.error.set(this.translate.instant('carpool.must_add_vehicle'));
        }
      }
    });
  }

  selectVehicle(id: number) {
    this.trip.vehicleId = id;
    this.updateStepper();
  }

  calculateDuration() {
    if (!this.trip.departureDate || !this.trip.departureTime ||
        !this.trip.arrivalDate || !this.trip.arrivalTime) {
      this.durationDisplay.set(this.translate.instant('create_carpool.duration_fill_times'));
      this.trip.estimatedDurationMinutes = undefined;
      return;
    }

    const dep = new Date(`${this.trip.departureDate}T${this.trip.departureTime}`);
    const arr = new Date(`${this.trip.arrivalDate}T${this.trip.arrivalTime}`);
    const diffMs = arr.getTime() - dep.getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin > 0) {
      this.trip.estimatedDurationMinutes = diffMin;
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      const formatted = h > 0
        ? `${h}h${m > 0 ? (m < 10 ? '0' + m : m) : '00'}`
        : `${m}min`;
      this.durationDisplay.set(`<strong>${formatted}</strong> (${diffMin} min)`);
    } else {
      this.trip.estimatedDurationMinutes = undefined;
      this.durationDisplay.set(`<span style="color:var(--danger)">${this.translate.instant('create_carpool.duration_error')}</span>`);
    }
  }

  onPausesCountChange() {
    if (!this.trip.pausesCount || this.trip.pausesCount === 0) {
      this.trip.pausesDurationMinutes = 0;
    }
  }

  updateStepper() {
    const t = this.trip;
    if (this.confirmed) { this.currentStep.set(5); return; }
    if (t.vehicleId > 0) { this.currentStep.set(4); return; }
    if (t.departureDate && t.departureTime && t.arrivalDate && t.arrivalTime && t.pricePerPerson >= 2) {
      this.currentStep.set(3); return;
    }
    if (t.departureCity && t.departureLocation && t.arrivalCity && t.arrivalLocation) {
      this.currentStep.set(2); return;
    }
    this.currentStep.set(1);
  }

  canSubmit(): boolean {
    const t = this.trip;
    return this.confirmed && !this.loading()
      && !!t.departureCity && !!t.departureLocation
      && !!t.arrivalCity && !!t.arrivalLocation
      && !!t.departureDate && !!t.departureTime
      && !!t.arrivalDate && !!t.arrivalTime
      && t.totalSeats >= 1 && t.pricePerPerson >= 2
      && t.vehicleId > 0;
  }

  createTrip() {
    if (!this.canSubmit()) return;

    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    const carpoolData = {
      ...this.trip,
      departureDate: new Date(this.trip.departureDate),
      arrivalDate: new Date(this.trip.arrivalDate)
    };

    this.carpoolService.create(carpoolData).subscribe({
      next: () => {
        this.success.set(this.translate.instant('carpool.created_successfully'));
        setTimeout(() => this.router.navigate(['/profile']), 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || this.translate.instant('messages.error_occurred'));
        this.loading.set(false);
      }
    });
  }

  // Vehicle display helpers
  getEnergyIcon = energyIcon;

  getEnergyShortLabel(type: string): string {
    switch (type) {
      case 'Electric': return 'Elec';
      case 'Hybrid': return 'Hyb.';
      case 'LPG': return 'GPL';
      default: return '';
    }
  }

  getEnergyLabel(type: string): string {
    return this.translate.instant('vehicle.types.' + type.toLowerCase());
  }

  getEmissionLabel(type: string): string {
    switch (type) {
      case 'Electric': return this.translate.instant('carpools.zero_emission');
      case 'Hybrid': return this.translate.instant('carpools.low_emission');
      default: return this.translate.instant('carpools.reduced_emission');
    }
  }

  getEnergyBadgeClass(type: string): string {
    switch (type) {
      case 'Electric': return 'elec';
      case 'Hybrid': return 'hybride';
      case 'LPG': return 'gpl';
      default: return 'elec';
    }
  }
}
