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
      <h1>Administration EcoRide</h1>

      <div class="grid grid-2">
        <div class="card">
          <h2>Créer un employé</h2>
          <form (ngSubmit)="createEmployee()">
            <div class="form-group">
              <label>Pseudo</label>
              <input type="text" [(ngModel)]="newEmployee.pseudo" name="pseudo" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="newEmployee.email" name="email" required>
            </div>
            <div class="form-group">
              <label>Mot de passe</label>
              <input type="password" [(ngModel)]="newEmployee.password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Créer</button>
          </form>
        </div>

        <div class="card">
          <h2>Statistiques</h2>
          @if (stats) {
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Total Crédits Gagnés</h3>
                <p class="stat-value">{{ stats.totalCreditsGagnes }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card mt-3">
        <h2>Utilisateurs</h2>
        @if (users.length > 0) {
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pseudo</th>
                <th>Email</th>
                <th>Rôles</th>
                <th>Crédits</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.utilisateurId) {
                <tr>
                  <td>{{ user.utilisateurId }}</td>
                  <td>{{ user.pseudo }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.roles.join(', ') }}</td>
                  <td>{{ user.credit }}</td>
                  <td>
                    <span [class]="user.estActif ? 'badge-success' : 'badge-danger'">
                      {{ user.estActif ? 'Actif' : 'Suspendu' }}
                    </span>
                  </td>
                  <td>
                    @if (user.estActif) {
                      <button (click)="suspendUser(user.utilisateurId)" class="btn-sm btn-danger">
                        Suspendre
                      </button>
                    } @else {
                      <button (click)="activateUser(user.utilisateurId)" class="btn-sm btn-primary">
                        Activer
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
    pseudo: '',
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
        alert('Employé créé avec succès');
        this.newEmployee = { pseudo: '', email: '', password: '' };
      },
      error: (err) => alert('Erreur: ' + (err.error?.message || 'Erreur inconnue'))
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
    if (confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
      this.http.put(`${environment.apiUrl}/admin/suspend-user/${id}`, {}).subscribe({
        next: () => {
          alert('Utilisateur suspendu');
          this.loadUsers();
        },
        error: (err) => console.error(err)
      });
    }
  }

  activateUser(id: number) {
    this.http.put(`${environment.apiUrl}/admin/activate-user/${id}`, {}).subscribe({
      next: () => {
        alert('Utilisateur activé');
        this.loadUsers();
      },
      error: (err) => console.error(err)
    });
  }
}
