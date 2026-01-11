import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <div class="register-container">
        <div class="card">
          <h2 class="text-center">{{ 'auth.register_title' | translate }}</h2>

          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }

          @if (success()) {
            <div class="alert alert-success">{{ success() }}</div>
          }

          <form (ngSubmit)="register()">
            <div class="form-group">
              <label for="username">{{ 'auth.username' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input
                type="text"
                id="username"
                [(ngModel)]="userData.username"
                name="username"
                [placeholder]="'auth.placeholder_username' | translate"
                required
                minlength="3">
              @if (errors().username) {
                <span class="error">{{ errors().username }}</span>
              }
            </div>

            <div class="form-group">
              <label for="email">{{ 'auth.email' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="userData.email"
                name="email"
                [placeholder]="'auth.placeholder_email' | translate"
                required>
            </div>

            <div class="form-group">
              <label for="password">{{ 'auth.password' | translate }} {{ 'auth.required_field_marker' | translate }}</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="userData.password"
                name="password"
                [placeholder]="'auth.placeholder_password_min' | translate"
                required
                minlength="8">
              <small>{{ 'auth.password_requirements' | translate }}</small>
              @if (errors().password) {
                <span class="error">{{ errors().password }}</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName">{{ 'auth.last_name' | translate }}</label>
              <input
                type="text"
                id="lastName"
                [(ngModel)]="userData.lastName"
                name="lastName"
                [placeholder]="'auth.placeholder_lastname' | translate">
            </div>

            <div class="form-group">
              <label for="firstName">{{ 'auth.first_name' | translate }}</label>
              <input
                type="text"
                id="firstName"
                [(ngModel)]="userData.firstName"
                name="firstName"
                [placeholder]="'auth.placeholder_firstname' | translate">
            </div>

            <div class="info-box">
              <p>✓ {{ 'auth.registration_bonus' | translate }}</p>
              <p>✓ {{ 'auth.become_driver' | translate }}</p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%;"
              [disabled]="loading()">
              {{ loading() ? ('auth.registering' | translate) : ('auth.sign_up' | translate) }}
            </button>
          </form>

          <p class="text-center mt-3">
            {{ 'auth.have_account' | translate }}
            <a routerLink="/login">{{ 'common.login' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 600px;
      margin: 2rem auto;
    }

    .card {
      padding: 2rem;
    }

    .info-box {
      background-color: var(--very-light-green);
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1rem;
      border-left: 4px solid var(--primary-green);
    }

    .info-box p {
      margin: 0.5rem 0;
      color: var(--dark-green);
    }

    a {
      color: var(--primary-green);
      font-weight: bold;
    }

    small {
      color: var(--gray);
      font-size: 0.85rem;
    }
  `]
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    lastName: '',
    firstName: ''
  };

  // Signal-based state
  errors = signal<any>({});
  error = signal('');
  success = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  register() {
    this.errors.set({});
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    // Validation
    if (this.userData.username.length < 3) {
      this.errors.set({ username: this.translate.instant('auth.username_min_length') });
      this.loading.set(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.userData.password)) {
      this.errors.set({ password: this.translate.instant('auth.password_security_error') });
      this.loading.set(false);
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.success.set(this.translate.instant('auth.registration_success'));
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || this.translate.instant('auth.registration_error'));
        this.loading.set(false);
      }
    });
  }
}
