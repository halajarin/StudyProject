import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <div class="login-container">
        <div class="card">
          <h2 class="text-center">{{ 'auth.login_title' | translate }}</h2>

          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }

          <form (ngSubmit)="login()">
            <div class="form-group">
              <label for="email">{{ 'auth.email' | translate }}</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="credentials.email"
                name="email"
                [placeholder]="'auth.placeholder_email' | translate"
                required>
            </div>

            <div class="form-group">
              <label for="password">{{ 'auth.password' | translate }}</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="credentials.password"
                name="password"
                [placeholder]="'auth.placeholder_password' | translate"
                required>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%;"
              [disabled]="loading()">
              {{ loading() ? ('auth.logging_in' | translate) : ('common.login' | translate) }}
            </button>
          </form>

          <p class="text-center mt-3">
            {{ 'auth.no_account' | translate }}
            <a routerLink="/register">{{ 'auth.sign_up' | translate }}</a>
          </p>

          <div class="test-credentials">
            <p><strong>{{ 'auth.test_accounts' | translate }}:</strong></p>
            <p><small>Email: jean.dupont@email.com | {{ 'auth.password' | translate }}: Password123!</small></p>
            <p><small>Email: admin@ecoride.fr | {{ 'auth.password' | translate }}: Password123!</small></p>
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

  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.error.set('');
    this.loading.set(true);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login error');
        this.loading.set(false);
      }
    });
  }
}
