import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/user.model';
import { AdminStats } from '../../../interfaces/admin-stats.interface';
import { AdminUserDetailStats } from '../../../interfaces/admin-user-stats.interface';
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
          <div class="stat-card">
            <h3>{{ 'admin.total_users' | translate }}</h3>
            <p class="stat-value">{{ stats.totalUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ 'admin.active_users' | translate }}</h3>
            <p class="stat-value">{{ stats.activeUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ 'admin.total_carpools' | translate }}</h3>
            <p class="stat-value">{{ stats.totalCarpools }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ 'admin.active_carpools' | translate }}</h3>
            <p class="stat-value">{{ stats.activeCarpools }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ 'admin.credits_circulating' | translate }}</h3>
            <p class="stat-value">{{ stats.totalCreditsCirculating }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ 'admin.total_credits' | translate }}</h3>
            <p class="stat-value">{{ stats.platformCreditsEarned }}</p>
          </div>
        </div>
      }

      <div class="card mt-3">
        <h2>{{ 'admin.create_employee' | translate }}</h2>
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

      <div class="card mt-3">
        <div class="users-header">
          <h2>{{ 'admin.users' | translate }}</h2>
          <div class="users-header-actions">
            <div class="status-filter">
              <label>{{ 'admin.status_label' | translate }}:</label>
              <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                <option value="all">{{ 'admin.filter_all' | translate }}</option>
                <option value="active">{{ 'admin.user_active' | translate }}</option>
                <option value="suspended">{{ 'admin.user_suspended' | translate }}</option>
              </select>
            </div>
            @if (filteredUsers().length > 0) {
              <button class="btn-sm btn-outline" (click)="toggleAll()">
                {{ allExpanded() ? ('admin.collapse_all' | translate) : ('admin.expand_all' | translate) }}
              </button>
            }
          </div>
        </div>
        @if (filteredUsers().length > 0) {
          <table class="users-table">
            <thead>
              <tr>
                <th class="th-expand"></th>
                <th>ID</th>
                <th>{{ 'auth.username' | translate }}</th>
                <th>{{ 'auth.email' | translate }}</th>
                <th>{{ 'user.roles' | translate }}</th>
                <th>{{ 'user.credits' | translate }}</th>
                <th>{{ 'admin.created_at' | translate }}</th>
                <th>{{ 'admin.deactivated_at' | translate }}</th>
                <th>{{ 'admin.status_label' | translate }}</th>
                <th>{{ 'common.edit' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.userId) {
                <tr class="user-row" [class.expanded]="isExpanded(user.userId)" (click)="toggleUserStats(user.userId)">
                  <td class="td-expand">
                    <span class="expand-icon" [class.rotated]="isExpanded(user.userId)">&#9656;</span>
                  </td>
                  <td>{{ user.userId }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    @for (role of user.roles; track role; let last = $last) {
                      <span class="role-tag">{{ 'admin.roles.' + role | translate }}</span>
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
                    <td colspan="10">
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
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background-color: var(--very-light-green);
      padding: 1.2rem;
      border-radius: 10px;
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.8rem;
      color: var(--dark-gray);
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--primary-green);
      margin: 0;
    }

    .employee-form {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .users-header h2 {
      margin: 0;
    }

    .users-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-filter {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .status-filter label {
      font-size: 0.85rem;
      color: var(--dark-gray);
      white-space: nowrap;
    }

    .status-filter select {
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

    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .users-table th,
    .users-table td {
      padding: 0.8rem;
      text-align: left;
      border-bottom: 1px solid var(--light-gray);
    }

    .users-table th {
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

    .user-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .user-row:hover {
      background-color: var(--very-light-green);
    }

    .user-row.expanded {
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
  `]
})
export class DashboardComponent implements OnInit {
  newEmployee = {
    username: '',
    email: '',
    password: ''
  };

  stats: AdminStats | null = null;
  users = signal<User[]>([]);
  statusFilter = signal<'all' | 'active' | 'suspended'>('all');
  expandedUserIds = signal<Set<number>>(new Set());
  userStatsMap = signal<Record<number, AdminUserDetailStats>>({});
  loadingStatsIds = signal<Set<number>>(new Set());

  filteredUsers = computed(() => {
    const filter = this.statusFilter();
    const all = this.users();
    if (filter === 'active') return all.filter(u => u.isActive);
    if (filter === 'suspended') return all.filter(u => !u.isActive);
    return all;
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
