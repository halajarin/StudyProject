import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/user.model';
import { AdminStats } from '../../../interfaces/admin-stats.interface';
import { AdminUserDetailStats } from '../../../interfaces/admin-user-stats.interface';
import { AdminCarpool } from '../../../interfaces/admin-carpool.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'admin.dashboard' | translate }}</h1>

      @if (stats) {
        <div class="admin-stats-grid">
          <div class="stat-card stat-card--users">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.total_users' | translate }}</span>
              <span class="stat-value">{{ stats.totalUsers }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--active">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.active_users' | translate }}</span>
              <span class="stat-value">{{ stats.activeUsers }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--carpools">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-4h9l4 4h3v6h-2"/><path d="M5 11l2-4h9l4 4"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.total_carpools' | translate }}</span>
              <span class="stat-value">{{ stats.totalCarpools }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--active-carpools">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.active_carpools' | translate }}</span>
              <span class="stat-value">{{ stats.activeCarpools }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--credits">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.credits_circulating' | translate }}</span>
              <span class="stat-value">{{ stats.totalCreditsCirculating }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--platform">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.total_credits' | translate }}</span>
              <span class="stat-value">{{ stats.platformCreditsEarned }}</span>
            </div>
          </div>
        </div>
      }

      <div class="employee-section">
        <h3>{{ 'admin.create_employee' | translate }}</h3>
        <form (ngSubmit)="createEmployee()" class="employee-form">
          <div class="form-group">
            <label>{{ 'auth.username' | translate }}</label>
            <input type="text" [(ngModel)]="newEmployee.username" name="username" required>
          </div>
          <div class="form-group">
            <label>{{ 'auth.email' | translate }}</label>
            <input type="email" [(ngModel)]="newEmployee.email" name="email" required>
          </div>
          <div class="form-group">
            <label>{{ 'auth.password' | translate }}</label>
            <input type="password" [(ngModel)]="newEmployee.password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary">{{ 'common.add' | translate }}</button>
        </form>
      </div>

      <!-- TABS -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'users'" (click)="activeTab.set('users')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ 'admin.tab_users' | translate }}
          <span class="tab-count">{{ users().length }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'carpools'" (click)="switchToCarpools()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-4h9l4 4h3v6h-2"/><path d="M5 11l2-4h9l4 4"/></svg>
          {{ 'admin.tab_carpools' | translate }}
          <span class="tab-count">{{ carpools().length }}</span>
        </button>
      </div>

      <!-- USERS TAB -->
      @if (activeTab() === 'users') {
        <div class="card tab-content">
          <div class="table-header">
            <div class="table-header-actions">
              <div class="filter-group">
                <label>{{ 'admin.status_label' | translate }}:</label>
                <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                  <option value="all">{{ 'admin.filter_all' | translate }}</option>
                  <option value="active">{{ 'admin.user_active' | translate }}</option>
                  <option value="suspended">{{ 'admin.user_suspended' | translate }}</option>
                </select>
              </div>
              <div class="filter-group">
                <label>{{ 'admin.filter_role' | translate }}:</label>
                <select [ngModel]="roleFilter()" (ngModelChange)="roleFilter.set($event)">
                  <option value="all">{{ 'admin.filter_all' | translate }}</option>
                  <option value="Driver">{{ 'admin.roles.Driver' | translate }}</option>
                  <option value="Passenger">{{ 'admin.roles.Passenger' | translate }}</option>
                  <option value="Employee">{{ 'admin.roles.Employee' | translate }}</option>
                  <option value="Administrator">{{ 'admin.roles.Administrator' | translate }}</option>
                </select>
              </div>
              @if (filteredUsers().length > 0) {
                <button class="btn-sm btn-outline" (click)="toggleAll()">
                  {{ allExpanded() ? ('admin.collapse_all' | translate) : ('admin.expand_all' | translate) }}
                </button>
              }
            </div>
            <span class="result-count">{{ filteredUsers().length }} / {{ users().length }}</span>
          </div>
          @if (filteredUsers().length > 0) {
            <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-expand"></th>
                  <th>ID</th>
                  <th>{{ 'auth.username' | translate }}</th>
                  <th>{{ 'auth.email' | translate }}</th>
                  <th>{{ 'user.roles' | translate }}</th>
                  <th>{{ 'user.my_vehicles' | translate }}</th>
                  <th>{{ 'user.credits' | translate }}</th>
                  <th>{{ 'admin.created_at' | translate }}</th>
                  <th>{{ 'admin.deactivated_at' | translate }}</th>
                  <th>{{ 'admin.status_label' | translate }}</th>
                  <th>{{ 'common.edit' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.userId) {
                  <tr class="clickable-row" [class.expanded]="isExpanded(user.userId)" (click)="toggleUserStats(user.userId)">
                    <td class="td-expand">
                      <span class="expand-icon" [class.rotated]="isExpanded(user.userId)">&#9656;</span>
                    </td>
                    <td>{{ user.userId }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      @for (role of user.roles; track role) {
                        <span class="role-tag">{{ 'admin.roles.' + role | translate }}</span>
                      }
                    </td>
                    <td class="td-vehicles">
                      @if (user.vehicles && user.vehicles.length > 0) {
                        @for (v of user.vehicles; track v.vehicleId) {
                          <span class="vehicle-tag" [class.vehicle-electric]="v.energyType === 'Electric'">
                            {{ v.brand }} {{ v.model }}
                            <small>{{ v.registrationNumber }}</small>
                          </span>
                        }
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                    <td>{{ user.credits }}</td>
                    <td class="td-date">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td class="td-date">{{ user.deactivatedAt ? (user.deactivatedAt | date:'dd/MM/yyyy') : '-' }}</td>
                    <td>
                      <span [class]="user.isActive ? 'badge-success' : 'badge-danger'">
                        {{ user.isActive ? ('admin.user_active' | translate) : ('admin.user_suspended' | translate) }}
                      </span>
                    </td>
                    <td>
                      @if (user.isActive) {
                        <button (click)="suspendUser(user.userId); $event.stopPropagation()" class="btn-sm btn-danger">
                          {{ 'admin.deactivate_user' | translate }}
                        </button>
                      } @else {
                        <button (click)="activateUser(user.userId); $event.stopPropagation()" class="btn-sm btn-primary">
                          {{ 'admin.activate_user' | translate }}
                        </button>
                      }
                    </td>
                  </tr>
                  @if (isExpanded(user.userId)) {
                    <tr class="stats-row">
                      <td colspan="11">
                        @if (isLoading(user.userId)) {
                          <div class="stats-loading">{{ 'common.loading' | translate }}</div>
                        } @else if (getStats(user.userId); as stats) {
                          <div class="user-detail-stats">
                            <div class="role-badges">
                              @if (stats.isDriver) {
                                <span class="role-badge role-driver">{{ 'admin.stats.driver' | translate }}</span>
                              }
                              @if (stats.isPassenger) {
                                <span class="role-badge role-passenger">{{ 'admin.stats.passenger' | translate }}</span>
                              }
                            </div>
                            <div class="stats-cards-grid">
                              @if (stats.driverStats) {
                                <div class="detail-stat-card">
                                  <h4>{{ 'admin.stats.driver_trips' | translate }}</h4>
                                  <div class="stat-main-value">{{ stats.driverStats.totalCreated }}</div>
                                  <div class="stat-breakdown">
                                    <span class="stat-item pending">{{ 'admin.stats.pending' | translate }}: {{ stats.driverStats.pending }}</span>
                                    <span class="stat-item in-progress">{{ 'admin.stats.in_progress' | translate }}: {{ stats.driverStats.inProgress }}</span>
                                    <span class="stat-item completed">{{ 'admin.stats.completed' | translate }}: {{ stats.driverStats.completed }}</span>
                                    <span class="stat-item cancelled">{{ 'admin.stats.cancelled' | translate }}: {{ stats.driverStats.cancelled }}</span>
                                  </div>
                                </div>
                              }
                              @if (stats.passengerStats) {
                                <div class="detail-stat-card">
                                  <h4>{{ 'admin.stats.passenger_trips' | translate }}</h4>
                                  <div class="stat-main-value">{{ stats.passengerStats.totalParticipations }}</div>
                                  <div class="stat-breakdown">
                                    <span class="stat-item confirmed">{{ 'admin.stats.confirmed' | translate }}: {{ stats.passengerStats.confirmed }}</span>
                                    <span class="stat-item validated">{{ 'admin.stats.validated' | translate }}: {{ stats.passengerStats.validated }}</span>
                                    <span class="stat-item cancelled">{{ 'admin.stats.cancelled' | translate }}: {{ stats.passengerStats.cancelled }}</span>
                                  </div>
                                </div>
                              }
                              <div class="detail-stat-card">
                                <h4>{{ 'admin.stats.driver_ratings' | translate }}</h4>
                                <div class="stat-main-value">{{ stats.driverRatings.averageRating || '-' }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item">{{ 'admin.stats.review_count' | translate }}: {{ stats.driverRatings.count }}</span>
                                </div>
                              </div>
                              <div class="detail-stat-card">
                                <h4>{{ 'admin.stats.passenger_ratings' | translate }}</h4>
                                <div class="stat-main-value">{{ stats.passengerRatings.averageRating || '-' }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item">{{ 'admin.stats.review_count' | translate }}: {{ stats.passengerRatings.count }}</span>
                                </div>
                              </div>
                              <div class="detail-stat-card">
                                <h4>{{ 'admin.stats.reviews_given' | translate }}</h4>
                                <div class="stat-main-value">{{ stats.reviewsGiven.count }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item">{{ 'admin.stats.average_note_given' | translate }}: {{ stats.reviewsGiven.averageNoteGiven || '-' }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
            </div>
          }
        </div>
      }

      <!-- CARPOOLS TAB -->
      @if (activeTab() === 'carpools') {
        <div class="card tab-content">
          <div class="table-header">
            <div class="table-header-actions">
              <div class="filter-group">
                <label>{{ 'admin.status_label' | translate }}:</label>
                <select [ngModel]="carpoolStatusFilter()" (ngModelChange)="carpoolStatusFilter.set($event)">
                  <option value="all">{{ 'admin.filter_all' | translate }}</option>
                  <option value="Pending">{{ 'carpool.status.pending' | translate }}</option>
                  <option value="InProgress">{{ 'carpool.status.in_progress' | translate }}</option>
                  <option value="Completed">{{ 'carpool.status.completed' | translate }}</option>
                  <option value="Cancelled">{{ 'carpool.status.cancelled' | translate }}</option>
                </select>
              </div>
            </div>
            <span class="result-count">{{ filteredCarpools().length }} / {{ carpools().length }}</span>
          </div>
          @if (filteredCarpools().length > 0) {
            <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{{ 'admin.carpools_route' | translate }}</th>
                  <th>{{ 'carpool.departure_date' | translate }}</th>
                  <th>{{ 'admin.carpools_driver' | translate }}</th>
                  <th>{{ 'admin.carpools_vehicle' | translate }}</th>
                  <th>{{ 'admin.carpools_seats' | translate }}</th>
                  <th>{{ 'admin.carpools_price' | translate }}</th>
                  <th>{{ 'admin.status_label' | translate }}</th>
                  <th>{{ 'admin.created_at' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filteredCarpools(); track c.carpoolId) {
                  <tr>
                    <td>{{ c.carpoolId }}</td>
                    <td class="td-route">{{ c.departureCity }} → {{ c.arrivalCity }}</td>
                    <td class="td-date">{{ c.departureDate | date:'dd/MM/yyyy' }} {{ c.departureTime }}</td>
                    <td>{{ c.driverUsername }}</td>
                    <td class="td-vehicle">
                      <div>
                        {{ c.vehicleBrand }} {{ c.vehicleModel }}
                        @if (c.isEcological) {
                          <span class="badge-eco">EV</span>
                        }
                      </div>
                      <small class="text-muted">{{ c.vehicleRegistration }} - {{ c.vehicleColor }}</small>
                    </td>
                    <td>{{ c.availableSeats }} / {{ c.totalSeats }}</td>
                    <td>{{ c.pricePerPerson }} {{ 'common.credits' | translate }}</td>
                    <td>
                      <span class="status-badge status-{{ c.status.toLowerCase() }}">
                        {{ 'carpool.status.' + (c.status === 'InProgress' ? 'in_progress' : c.status.toLowerCase()) | translate }}
                      </span>
                    </td>
                    <td class="td-date">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
            </div>
          } @else {
            <p class="no-results">{{ 'admin.carpools_no_results' | translate }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 12px;
      background: white;
      border: 1px solid var(--light-gray);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .stat-card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card--users .stat-card-icon { background: #e3f2fd; color: #1565c0; }
    .stat-card--active .stat-card-icon { background: #e8f5e9; color: #2e7d32; }
    .stat-card--carpools .stat-card-icon { background: #fff3e0; color: #e65100; }
    .stat-card--active-carpools .stat-card-icon { background: #f3e5f5; color: #7b1fa2; }
    .stat-card--credits .stat-card-icon { background: #e0f7fa; color: #00838f; }
    .stat-card--platform .stat-card-icon { background: #fce4ec; color: #c62828; }

    .stat-card-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 0.78rem;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      line-height: 1.3;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--black);
      margin: 0;
      line-height: 1.2;
    }

    .employee-section {
      background: white;
      border: 1px solid var(--light-gray);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .employee-section h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
    }

    .employee-form {
      display: flex;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .employee-form .form-group {
      flex: 1;
      min-width: 160px;
    }

    .employee-form .form-group label {
      font-size: 0.82rem;
      color: var(--gray);
    }

    .employee-form .form-group input {
      margin-top: 0.25rem;
    }

    .employee-form .btn {
      height: 42px;
      white-space: nowrap;
    }

    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 0;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--light-gray);
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      background: white;
      color: var(--gray);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--dark-green);
      background: var(--very-light-green);
    }

    .tab.active {
      color: var(--dark-green);
      background: white;
      border-color: var(--light-gray);
      position: relative;
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: white;
    }

    .tab-count {
      background: var(--light-gray);
      color: var(--gray);
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .tab.active .tab-count {
      background: var(--primary-green);
      color: white;
    }

    .tab-content {
      border-radius: 0 10px 10px 10px;
      margin-top: 0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .table-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .result-count {
      font-size: 0.85rem;
      color: var(--gray);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .filter-group label {
      font-size: 0.85rem;
      color: var(--gray);
      white-space: nowrap;
    }

    .filter-group select {
      padding: 0.3rem 0.5rem;
      border: 1px solid var(--light-gray);
      border-radius: 6px;
      font-size: 0.85rem;
      background: white;
      cursor: pointer;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--primary-green);
      color: var(--primary-green);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline:hover {
      background: var(--primary-green);
      color: white;
    }

    .table-scroll {
      overflow-x: auto;
      margin: 1rem -0.5rem 0;
      padding: 0 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: var(--primary-green) transparent;
    }

    .table-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .table-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .table-scroll::-webkit-scrollbar-thumb {
      background: var(--primary-green);
      border-radius: 3px;
    }

    .data-table {
      width: 100%;
      min-width: 900px;
      border-collapse: collapse;
      margin-top: 0;
    }

    .data-table th,
    .data-table td {
      padding: 0.8rem;
      text-align: left;
      border-bottom: 1px solid var(--light-gray);
    }

    .data-table th {
      background-color: var(--dark-green);
      color: var(--white);
    }

    .th-expand {
      width: 2rem;
    }

    .td-expand {
      width: 2rem;
      text-align: center;
    }

    .expand-icon {
      display: inline-block;
      font-size: 0.9rem;
      color: var(--primary-green);
      transition: transform 0.2s ease;
    }

    .expand-icon.rotated {
      transform: rotate(90deg);
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: var(--very-light-green);
    }

    .clickable-row.expanded {
      background-color: var(--very-light-green);
    }

    .role-tag {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      margin: 0.1rem 0.2rem;
      border-radius: 12px;
      font-size: 0.78rem;
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .td-date {
      white-space: nowrap;
      font-size: 0.85rem;
      color: var(--gray);
    }

    .stats-row td {
      padding: 0 !important;
      background-color: #f8faf8;
    }

    .stats-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--medium-gray);
    }

    .user-detail-stats {
      padding: 1.5rem;
    }

    .role-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .role-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .role-driver {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .role-passenger {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .detail-stat-card {
      background: white;
      border: 1px solid var(--light-gray);
      border-radius: 10px;
      padding: 1rem;
      text-align: center;
    }

    .detail-stat-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.85rem;
      color: var(--medium-gray);
      text-transform: uppercase;
    }

    .stat-main-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--primary-green);
      margin-bottom: 0.5rem;
    }

    .stat-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-item {
      font-size: 0.8rem;
      color: var(--dark-gray);
    }

    .stat-item.pending { color: #f57c00; }
    .stat-item.in-progress { color: #1976d2; }
    .stat-item.completed { color: #388e3c; }
    .stat-item.confirmed { color: #1976d2; }
    .stat-item.validated { color: #388e3c; }
    .stat-item.cancelled { color: #d32f2f; }

    .btn-sm {
      padding: 0.3rem 0.8rem;
      font-size: 0.85rem;
    }

    .td-route {
      font-weight: 600;
      color: var(--dark-green);
      white-space: nowrap;
    }

    .td-vehicle {
      white-space: nowrap;
    }

    .badge-eco {
      display: inline-block;
      padding: 0.1rem 0.4rem;
      margin-left: 0.3rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-pending { background: #fff3e0; color: #e65100; }
    .status-inprogress { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }

    .no-results {
      text-align: center;
      color: var(--gray);
      padding: 2rem;
    }

    .td-vehicles {
      max-width: 200px;
    }

    .vehicle-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.15rem 0.5rem;
      margin: 0.1rem 0.15rem;
      border-radius: 6px;
      font-size: 0.78rem;
      background: #f5f5f5;
      border: 1px solid var(--light-gray);
      white-space: nowrap;
    }

    .vehicle-tag small {
      color: var(--gray);
      font-size: 0.7rem;
    }

    .vehicle-electric {
      background: #e8f5e9;
      border-color: #a5d6a7;
    }

    .text-muted {
      color: var(--gray);
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  newEmployee = {
    username: '',
    email: '',
    password: ''
  };

  activeTab = signal<'users' | 'carpools'>('users');

  stats: AdminStats | null = null;
  users = signal<User[]>([]);
  statusFilter = signal<'all' | 'active' | 'suspended'>('all');
  roleFilter = signal<string>('all');
  expandedUserIds = signal<Set<number>>(new Set());
  userStatsMap = signal<Record<number, AdminUserDetailStats>>({});
  loadingStatsIds = signal<Set<number>>(new Set());

  carpools = signal<AdminCarpool[]>([]);
  carpoolStatusFilter = signal<string>('all');
  carpoolsLoaded = false;

  filteredUsers = computed(() => {
    const status = this.statusFilter();
    const role = this.roleFilter();
    let result = this.users();
    if (status === 'active') result = result.filter(u => u.isActive);
    if (status === 'suspended') result = result.filter(u => !u.isActive);
    if (role !== 'all') result = result.filter(u => u.roles.includes(role));
    return result;
  });

  filteredCarpools = computed(() => {
    const status = this.carpoolStatusFilter();
    const all = this.carpools();
    if (status === 'all') return all;
    return all.filter(c => c.status === status);
  });

  allExpanded = computed(() => {
    const filtered = this.filteredUsers();
    return filtered.length > 0 && filtered.every(u => this.expandedUserIds().has(u.userId));
  });

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  isExpanded(userId: number): boolean {
    return this.expandedUserIds().has(userId);
  }

  isLoading(userId: number): boolean {
    return this.loadingStatsIds().has(userId);
  }

  getStats(userId: number): AdminUserDetailStats | null {
    return this.userStatsMap()[userId] ?? null;
  }

  createEmployee() {
    this.http.post(`${environment.apiUrl}/admin/create-employee`, this.newEmployee).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.newEmployee = { username: '', email: '', password: '' };
      },
      error: (err) => alert(this.translate.instant('common.error') + ': ' + (err.error?.message || this.translate.instant('messages.error_occurred')))
    });
  }

  loadStats() {
    this.http.get<AdminStats>(`${environment.apiUrl}/admin/statistics`).subscribe({
      next: (data) => this.stats = data,
    });
  }

  loadUsers() {
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => this.users.set(data),
    });
  }

  switchToCarpools() {
    this.activeTab.set('carpools');
    if (!this.carpoolsLoaded) {
      this.loadCarpools();
    }
  }

  loadCarpools() {
    this.http.get<AdminCarpool[]>(`${environment.apiUrl}/admin/carpools`).subscribe({
      next: (data) => {
        this.carpools.set(data);
        this.carpoolsLoaded = true;
      },
    });
  }

  toggleUserStats(userId: number) {
    const current = new Set(this.expandedUserIds());
    if (current.has(userId)) {
      current.delete(userId);
      this.expandedUserIds.set(current);
      return;
    }

    current.add(userId);
    this.expandedUserIds.set(current);
    this.loadUserStats(userId);
  }

  toggleAll() {
    const filtered = this.filteredUsers();
    if (this.allExpanded()) {
      const current = new Set(this.expandedUserIds());
      for (const u of filtered) current.delete(u.userId);
      this.expandedUserIds.set(current);
      return;
    }

    const current = new Set(this.expandedUserIds());
    for (const u of filtered) current.add(u.userId);
    this.expandedUserIds.set(current);

    for (const user of filtered) {
      if (!this.userStatsMap()[user.userId]) {
        this.loadUserStats(user.userId);
      }
    }
  }

  private loadUserStats(userId: number) {
    if (this.userStatsMap()[userId] || this.loadingStatsIds().has(userId)) {
      return;
    }

    const loading = new Set(this.loadingStatsIds());
    loading.add(userId);
    this.loadingStatsIds.set(loading);

    this.http.get<AdminUserDetailStats>(`${environment.apiUrl}/admin/users/${userId}/stats`).subscribe({
      next: (data) => {
        this.userStatsMap.set({ ...this.userStatsMap(), [userId]: data });
        const done = new Set(this.loadingStatsIds());
        done.delete(userId);
        this.loadingStatsIds.set(done);
      },
      error: () => {
        const done = new Set(this.loadingStatsIds());
        done.delete(userId);
        this.loadingStatsIds.set(done);
      }
    });
  }

  suspendUser(id: number) {
    if (confirm(this.translate.instant('messages.confirm_delete'))) {
      this.http.put(`${environment.apiUrl}/admin/suspend-user/${id}`, {}).subscribe({
        next: () => {
          alert(this.translate.instant('messages.operation_successful'));
          this.loadUsers();
        },
      });
    }
  }

  activateUser(id: number) {
    this.http.put(`${environment.apiUrl}/admin/activate-user/${id}`, {}).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.loadUsers();
      },
    });
  }
}
