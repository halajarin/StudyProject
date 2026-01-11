import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../models/user.model';
import { AdminStats } from '../../../interfaces/admin-stats.interface';
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
                <tr>
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
                      <button (click)="suspendUser(user.userId)" class="btn-sm btn-danger">
                        {{ 'admin.deactivate_user' | translate }}
                      </button>
                    } @else {
                      <button (click)="activateUser(user.userId)" class="btn-sm btn-primary">
                        {{ 'admin.activate_user' | translate }}
                      </button>
                    }
                  </td>
                </tr>
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
