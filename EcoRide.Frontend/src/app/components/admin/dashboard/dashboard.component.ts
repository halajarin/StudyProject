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
          <div class="stat-card stat-card--active">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.active_users' | translate }}</span>
              <span class="stat-value">{{ stats.activeUsers }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--drivers">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-6l2-4h9l4 4h3v6h-2"/><path d="M5 11l2-4h9l4 4"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.driver_count' | translate }}</span>
              <span class="stat-value">{{ stats.driverCount }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--passengers">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.passenger_count' | translate }}</span>
              <span class="stat-value">{{ stats.passengerCount }}</span>
            </div>
            <span class="stat-sub-label">{{ 'admin.of_which_drivers' | translate:{ count: stats.driverAndPassengerCount } }}</span>
          </div>
          <div class="stat-card stat-card--completed">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.completed_carpools' | translate }}</span>
              <span class="stat-value">{{ stats.completedCarpools }}</span>
            </div>
          </div>
          <div class="stat-card stat-card--inprogress">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div class="stat-card-content">
              <span class="stat-label">{{ 'admin.in_progress_carpools' | translate }}</span>
              <span class="stat-value">{{ stats.inProgressCarpools }}</span>
            </div>
            <span class="stat-sub-label">{{ (stats.inProgressCarpools > 0 ? 'admin.of_which_pending' : 'admin.pending_trips') | translate:{ count: stats.pendingCarpools } }}</span>
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
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-expand"></th>
                  <th class="sortable" (click)="toggleUserSort('userId')">ID {{ getUserSortArrow('userId') }}</th>
                  <th class="sortable" (click)="toggleUserSort('username')">{{ 'auth.username' | translate }} {{ getUserSortArrow('username') }}</th>
                  <th class="sortable" (click)="toggleUserSort('email')">{{ 'auth.email' | translate }} {{ getUserSortArrow('email') }}</th>
                  <th>{{ 'user.roles' | translate }}</th>
                  <th>{{ 'user.my_vehicles' | translate }}</th>
                  <th class="sortable" (click)="toggleUserSort('credits')">{{ 'user.credits' | translate }} {{ getUserSortArrow('credits') }}</th>
                  <th class="sortable" (click)="toggleUserSort('createdAt')">{{ 'admin.created_at' | translate }} {{ getUserSortArrow('createdAt') }}</th>
                  <th>{{ 'admin.deactivated_at' | translate }}</th>
                  <th class="sortable" (click)="toggleUserSort('isActive')">{{ 'admin.status_label' | translate }} {{ getUserSortArrow('isActive') }}</th>
                  <th>{{ 'common.edit' | translate }}</th>
                </tr>
                <tr class="filter-row">
                  <th></th>
                  <th><input class="column-filter" (input)="setUserFilter('userId', $event)" (click)="$event.stopPropagation()" placeholder="ID"></th>
                  <th><input class="column-filter" (input)="setUserFilter('username', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setUserFilter('email', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setUserFilter('roles', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setUserFilter('vehicles', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setUserFilter('credits', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setUserFilter('createdAt', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @if (filteredUsers().length === 0) {
                  <tr><td colspan="11" class="no-results">{{ 'admin.carpools_no_results' | translate }}</td></tr>
                }
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
                          <span class="vehicle-tag vehicle-green">
                            {{ v.energyType === 'Electric' ? '⚡' : v.energyType === 'Hybrid' ? '🔋' : '🌿' }}
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
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" (click)="toggleCarpoolSort('carpoolId')">ID {{ getCarpoolSortArrow('carpoolId') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('departureCity')">{{ 'admin.carpools_route' | translate }} {{ getCarpoolSortArrow('departureCity') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('departureDate')">{{ 'carpool.departure_date' | translate }} {{ getCarpoolSortArrow('departureDate') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('driverUsername')">{{ 'admin.carpools_driver' | translate }} {{ getCarpoolSortArrow('driverUsername') }}</th>
                  <th>{{ 'admin.carpools_vehicle' | translate }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('availableSeats')">{{ 'admin.carpools_seats' | translate }} {{ getCarpoolSortArrow('availableSeats') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('pricePerPerson')">{{ 'admin.carpools_price' | translate }} {{ getCarpoolSortArrow('pricePerPerson') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('status')">{{ 'admin.status_label' | translate }} {{ getCarpoolSortArrow('status') }}</th>
                  <th class="sortable" (click)="toggleCarpoolSort('createdAt')">{{ 'admin.created_at' | translate }} {{ getCarpoolSortArrow('createdAt') }}</th>
                </tr>
                <tr class="filter-row">
                  <th><input class="column-filter" (input)="setCarpoolFilter('carpoolId', $event)" (click)="$event.stopPropagation()" placeholder="ID"></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('departureCity', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('departureDate', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('driverUsername', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('vehicle', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('availableSeats', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('pricePerPerson', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('status', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                  <th><input class="column-filter" (input)="setCarpoolFilter('createdAt', $event)" (click)="$event.stopPropagation()" placeholder="..."></th>
                </tr>
              </thead>
              <tbody>
                @if (filteredCarpools().length === 0) {
                  <tr><td colspan="9" class="no-results">{{ 'admin.carpools_no_results' | translate }}</td></tr>
                }
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
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      gap: 0 0.75rem;
      align-items: center;
      padding: 1rem;
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

    .stat-card--active .stat-card-icon { background: #e8f5e9; color: #2e7d32; }
    .stat-card--drivers .stat-card-icon { background: #e3f2fd; color: #1565c0; }
    .stat-card--passengers .stat-card-icon { background: #f3e5f5; color: #7b1fa2; }
    .stat-card--completed .stat-card-icon { background: #e8f5e9; color: #2e7d32; }
    .stat-card--inprogress .stat-card-icon { background: #fff3e0; color: #e65100; }

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

    .stat-sub-label {
      grid-column: 1 / -1;
      font-size: 0.7rem;
      color: var(--gray);
      font-style: italic;
      line-height: 1.2;
      margin-top: 0.25rem;
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
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    .employee-form .form-group label {
      font-size: 0.82rem;
      color: var(--gray);
    }

    .employee-form .form-group input {
      margin-top: 0.25rem;
    }

    .employee-form .btn {
      grid-column: 3;
      justify-self: end;
      height: 38px;
      white-space: nowrap;
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

    .data-table { min-width: 900px; }

    .role-tag {
      display: inline-block;
      padding: 0.1rem 0.4rem;
      margin: 0.1rem 0.15rem;
      border-radius: 12px;
      font-size: 0.72rem;
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .td-date {
      white-space: nowrap;
      font-size: 0.82rem;
      color: var(--gray);
    }

    .stats-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--medium-gray);
    }

    .user-detail-stats {
      padding: 1rem;
    }

    .role-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
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
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .stat-main-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--primary-green);
      margin-bottom: 0.5rem;
    }

    .stat-item.pending { color: #f57c00; }
    .stat-item.in-progress { color: #1976d2; }
    .stat-item.completed { color: #388e3c; }
    .stat-item.confirmed { color: #1976d2; }
    .stat-item.validated { color: #388e3c; }
    .stat-item.cancelled { color: #d32f2f; }

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

    .td-vehicles {
      max-width: 200px;
    }

    .vehicle-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.1rem 0.4rem;
      margin: 0.1rem 0.1rem;
      border-radius: 6px;
      font-size: 0.72rem;
      background: #f5f5f5;
      border: 1px solid var(--light-gray);
      white-space: nowrap;
    }

    .vehicle-tag small {
      color: var(--gray);
      font-size: 0.65rem;
    }

    .vehicle-green {
      background: #e8f5e9;
      border-color: #a5d6a7;
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

  // Sorting — Users
  userSortColumn = signal<string>('');
  userSortDirection = signal<'asc' | 'desc'>('asc');

  // Column filters — Users
  userColumnFilters = signal<Record<string, string>>({});

  carpools = signal<AdminCarpool[]>([]);
  carpoolStatusFilter = signal<string>('all');
  carpoolsLoaded = false;

  // Sorting — Carpools
  carpoolSortColumn = signal<string>('');
  carpoolSortDirection = signal<'asc' | 'desc'>('asc');

  // Column filters — Carpools
  carpoolColumnFilters = signal<Record<string, string>>({});

  filteredUsers = computed(() => {
    const status = this.statusFilter();
    const role = this.roleFilter();
    const filters = this.userColumnFilters();
    const sortCol = this.userSortColumn();
    const sortDir = this.userSortDirection();

    let result = this.users();
    if (status === 'active') result = result.filter(u => u.isActive);
    if (status === 'suspended') result = result.filter(u => !u.isActive);
    if (role !== 'all') result = result.filter(u => u.roles.includes(role));

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const lower = value.toLowerCase();
      result = result.filter(u => {
        if (key === 'roles') {
          const raw = (u.roles || []).join(' ').toLowerCase();
          const translated = (u.roles || []).map(r => this.translate.instant('admin.roles.' + r)).join(' ').toLowerCase();
          return raw.includes(lower) || translated.includes(lower);
        }
        if (key === 'vehicles') {
          return (u.vehicles || []).some(v =>
            `${v.brand} ${v.model} ${v.registrationNumber} ${v.color}`.toLowerCase().includes(lower)
          );
        }
        const val = (u as any)[key];
        return String(val ?? '').toLowerCase().includes(lower);
      });
    }

    // Sorting
    if (sortCol) {
      result = this.sortData([...result], sortCol, sortDir);
    }

    return result;
  });

  filteredCarpools = computed(() => {
    const status = this.carpoolStatusFilter();
    const filters = this.carpoolColumnFilters();
    const sortCol = this.carpoolSortColumn();
    const sortDir = this.carpoolSortDirection();

    let result = this.carpools();
    if (status !== 'all') result = result.filter(c => c.status === status);

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const lower = value.toLowerCase();
      result = result.filter(c => {
        if (key === 'vehicle') {
          return `${c.vehicleBrand} ${c.vehicleModel} ${c.vehicleRegistration} ${c.vehicleColor}`.toLowerCase().includes(lower);
        }
        if (key === 'departureCity') {
          return `${c.departureCity} ${c.arrivalCity}`.toLowerCase().includes(lower);
        }
        if (key === 'status') {
          const statusKey = c.status === 'InProgress' ? 'in_progress' : c.status.toLowerCase();
          const translated = this.translate.instant('carpool.status.' + statusKey);
          return translated.toLowerCase().includes(lower) || c.status.toLowerCase().includes(lower);
        }
        const val = (c as any)[key];
        return String(val ?? '').toLowerCase().includes(lower);
      });
    }

    // Sorting
    if (sortCol) {
      result = this.sortData([...result], sortCol, sortDir);
    }

    return result;
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
    this.loadCarpools();
  }

  // --- Sort helpers ---

  toggleUserSort(column: string) {
    if (this.userSortColumn() === column) {
      this.userSortDirection.set(this.userSortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.userSortColumn.set(column);
      this.userSortDirection.set('asc');
    }
  }

  toggleCarpoolSort(column: string) {
    if (this.carpoolSortColumn() === column) {
      this.carpoolSortDirection.set(this.carpoolSortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.carpoolSortColumn.set(column);
      this.carpoolSortDirection.set('asc');
    }
  }

  getUserSortArrow(column: string): string {
    if (this.userSortColumn() !== column) return '';
    return this.userSortDirection() === 'asc' ? '▲' : '▼';
  }

  getCarpoolSortArrow(column: string): string {
    if (this.carpoolSortColumn() !== column) return '';
    return this.carpoolSortDirection() === 'asc' ? '▲' : '▼';
  }

  private sortData<T>(data: T[], column: string, direction: 'asc' | 'desc'): T[] {
    return data.sort((a, b) => {
      const valA = (a as any)[column];
      const valB = (b as any)[column];

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison: number;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        comparison = (valA === valB) ? 0 : (valA ? -1 : 1);
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // --- Column filter helpers ---

  setUserFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.userColumnFilters.set({ ...this.userColumnFilters(), [column]: value });
  }

  setCarpoolFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.carpoolColumnFilters.set({ ...this.carpoolColumnFilters(), [column]: value });
  }

  // --- Existing methods ---

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
