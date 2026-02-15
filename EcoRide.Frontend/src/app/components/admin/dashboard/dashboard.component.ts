import { Component, OnInit, signal } from '@angular/core';
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

      <div class="grid grid-2">
        <div class="card">
          <h2>{{ 'admin.create_employee' | translate }}</h2>
          <form (ngSubmit)="createEmployee()">
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

        <div class="card">
          <h2>{{ 'admin.statistics' | translate }}</h2>
          @if (stats) {
            <div class="stats-grid">
              <div class="stat-card">
                <h3>{{ 'admin.total_credits' | translate }}</h3>
                <p class="stat-value">{{ stats.platformCreditsEarned }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card mt-3">
        <h2>{{ 'admin.users' | translate }}</h2>
        @if (users().length > 0) {
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ 'auth.username' | translate }}</th>
                <th>{{ 'auth.email' | translate }}</th>
                <th>{{ 'user.roles' | translate }}</th>
                <th>{{ 'user.credits' | translate }}</th>
                <th>{{ 'carpool.status' | translate }}</th>
                <th>{{ 'common.edit' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.userId) {
                <tr class="user-row" (click)="toggleUserStats(user.userId)">
                  <td>{{ user.userId }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.roles.join(', ') }}</td>
                  <td>{{ user.credits }}</td>
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
                @if (expandedUserId() === user.userId) {
                  <tr class="stats-row">
                    <td colspan="7">
                      @if (loadingStats()) {
                        <div class="stats-loading">{{ 'common.loading' | translate }}</div>
                      } @else if (userStats()) {
                        <div class="user-detail-stats">
                          <div class="role-badges">
                            @if (userStats()!.isDriver) {
                              <span class="role-badge role-driver">{{ 'admin.stats.driver' | translate }}</span>
                            }
                            @if (userStats()!.isPassenger) {
                              <span class="role-badge role-passenger">{{ 'admin.stats.passenger' | translate }}</span>
                            }
                          </div>

                          <div class="stats-cards-grid">
                            @if (userStats()!.driverStats) {
                              <div class="detail-stat-card">
                                <h4>{{ 'admin.stats.driver_trips' | translate }}</h4>
                                <div class="stat-main-value">{{ userStats()!.driverStats!.totalCreated }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item pending">{{ 'admin.stats.pending' | translate }}: {{ userStats()!.driverStats!.pending }}</span>
                                  <span class="stat-item in-progress">{{ 'admin.stats.in_progress' | translate }}: {{ userStats()!.driverStats!.inProgress }}</span>
                                  <span class="stat-item completed">{{ 'admin.stats.completed' | translate }}: {{ userStats()!.driverStats!.completed }}</span>
                                  <span class="stat-item cancelled">{{ 'admin.stats.cancelled' | translate }}: {{ userStats()!.driverStats!.cancelled }}</span>
                                </div>
                              </div>
                            }

                            @if (userStats()!.passengerStats) {
                              <div class="detail-stat-card">
                                <h4>{{ 'admin.stats.passenger_trips' | translate }}</h4>
                                <div class="stat-main-value">{{ userStats()!.passengerStats!.totalParticipations }}</div>
                                <div class="stat-breakdown">
                                  <span class="stat-item confirmed">{{ 'admin.stats.confirmed' | translate }}: {{ userStats()!.passengerStats!.confirmed }}</span>
                                  <span class="stat-item validated">{{ 'admin.stats.validated' | translate }}: {{ userStats()!.passengerStats!.validated }}</span>
                                  <span class="stat-item cancelled">{{ 'admin.stats.cancelled' | translate }}: {{ userStats()!.passengerStats!.cancelled }}</span>
                                </div>
                              </div>
                            }

                            <div class="detail-stat-card">
                              <h4>{{ 'admin.stats.driver_ratings' | translate }}</h4>
                              <div class="stat-main-value">{{ userStats()!.driverRatings.averageRating || '-' }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ 'admin.stats.review_count' | translate }}: {{ userStats()!.driverRatings.count }}</span>
                              </div>
                            </div>

                            <div class="detail-stat-card">
                              <h4>{{ 'admin.stats.passenger_ratings' | translate }}</h4>
                              <div class="stat-main-value">{{ userStats()!.passengerRatings.averageRating || '-' }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ 'admin.stats.review_count' | translate }}: {{ userStats()!.passengerRatings.count }}</span>
                              </div>
                            </div>

                            <div class="detail-stat-card">
                              <h4>{{ 'admin.stats.reviews_given' | translate }}</h4>
                              <div class="stat-main-value">{{ userStats()!.reviewsGiven.count }}</div>
                              <div class="stat-breakdown">
                                <span class="stat-item">{{ 'admin.stats.average_note_given' | translate }}: {{ userStats()!.reviewsGiven.averageNoteGiven || '-' }}</span>
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
    .stats-grid {
      display: grid;
      gap: 1rem;
    }

    .stat-card {
      background-color: var(--very-light-green);
      padding: 1.5rem;
      border-radius: 10px;
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary-green);
      margin: 0;
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

    .user-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .user-row:hover {
      background-color: var(--very-light-green);
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
  expandedUserId = signal<number | null>(null);
  userStats = signal<AdminUserDetailStats | null>(null);
  loadingStats = signal(false);

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
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
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
      this.userStats.set(null);
      return;
    }

    this.expandedUserId.set(userId);
    this.userStats.set(null);
    this.loadingStats.set(true);

    this.http.get<AdminUserDetailStats>(`${environment.apiUrl}/admin/users/${userId}/stats`).subscribe({
      next: (data) => {
        this.userStats.set(data);
        this.loadingStats.set(false);
      },
      error: () => {
        this.loadingStats.set(false);
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
