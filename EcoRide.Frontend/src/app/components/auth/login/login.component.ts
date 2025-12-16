import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="login-container">
        <div class="card">
          <h2 class="text-center">Login to EcoRide</h2>

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          <form (ngSubmit)="login()">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="credentials.email"
                name="email"
                placeholder="your@email.com"
                required>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Your password"
                required>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%;"
              [disabled]="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>

          <p class="text-center mt-3">
            Don't have an account?
            <a routerLink="/register">Sign up</a>
          </p>

          <div class="test-credentials">
            <p><strong>Test accounts:</strong></p>
            <p><small>Email: jean.dupont@email.com | Password: Password123!</small></p>
            <p><small>Email: admin@ecoride.fr | Password: Password123!</small></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 500px;
      margin: 2rem auto;
    }

    .card {
      padding: 2rem;
    }

    .test-credentials {
      margin-top: 2rem;
      padding: 1rem;
      background-color: var(--light-gray);
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .test-credentials p {
      margin: 0.5rem 0;
    }

    a {
      color: var(--primary-green);
      font-weight: bold;
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.error = '';
    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login error';
        this.loading = false;
      }
    });
  }
}
