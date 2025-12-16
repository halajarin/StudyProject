import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>EcoRide Administration</h1>

      <div class="grid grid-2">
        <div class="card">
          <h2>Create an employee</h2>
          <form (ngSubmit)="createEmployee()">
            <div class="form-group">
              <label>Username</label>
              <input type="text" [(ngModel)]="newEmployee.username" name="username" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="newEmployee.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="newEmployee.password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Create</button>
          </form>
        </div>

        <div class="card">
          <h2>Statistics</h2>
          @if (stats) {
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Total Credits Earned</h3>
                <p class="stat-value">{{ stats.totalCreditsGagnes }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card mt-3">
        <h2>Users</h2>
        @if (users.length > 0) {
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.userId) {
                <tr>
                  <td>{{ user.userId }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.roles.join(', ') }}</td>
                  <td>{{ user.credits }}</td>
                  <td>
                    <span [class]="user.isActive ? 'badge-success' : 'badge-danger'">
                      {{ user.isActive ? 'Active' : 'Suspended' }}
                    </span>
                  </td>
                  <td>
                    @if (user.isActive) {
                      <button (click)="suspendUser(user.userId)" class="btn-sm btn-danger">
                        Suspend
                      </button>
                    } @else {
                      <button (click)="activateUser(user.userId)" class="btn-sm btn-primary">
                        Activate
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

  stats: any = null;
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  createEmployee() {
    this.http.post(`${environment.apiUrl}/admin/create-employee`, this.newEmployee).subscribe({
      next: () => {
        alert('Employee created successfully');
        this.newEmployee = { username: '', email: '', password: '' };
      },
      error: (err) => alert('Error: ' + (err.error?.message || 'Unknown error'))
    });
  }

  loadStats() {
    this.http.get(`${environment.apiUrl}/admin/statistics`).subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error(err)
    });
  }

  loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error(err)
    });
  }

  suspendUser(id: number) {
    if (confirm('Are you sure you want to suspend this user?')) {
      this.http.put(`${environment.apiUrl}/admin/suspend-user/${id}`, {}).subscribe({
        next: () => {
          alert('User suspended');
          this.loadUsers();
        },
        error: (err) => console.error(err)
      });
    }
  }

  activateUser(id: number) {
    this.http.put(`${environment.apiUrl}/admin/activate-user/${id}`, {}).subscribe({
      next: () => {
        alert('User activated');
        this.loadUsers();
      },
      error: (err) => console.error(err)
    });
  }
}
