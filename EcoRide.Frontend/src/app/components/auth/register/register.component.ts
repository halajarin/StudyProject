import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="register-container">
        <div class="card">
          <h2 class="text-center">Create an EcoRide account</h2>

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          @if (success) {
            <div class="alert alert-success">{{ success }}</div>
          }

          <form (ngSubmit)="register()">
            <div class="form-group">
              <label for="username">Username *</label>
              <input
                type="text"
                id="username"
                [(ngModel)]="userData.username"
                name="username"
                placeholder="Your username"
                required
                minlength="3">
              @if (errors.username) {
                <span class="error">{{ errors.username }}</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="userData.email"
                name="email"
                placeholder="your@email.com"
                required>
            </div>

            <div class="form-group">
              <label for="password">Password *</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="userData.password"
                name="password"
                placeholder="Minimum 8 characters"
                required
                minlength="8">
              <small>Password must contain at least one uppercase, one lowercase, one number and one special character</small>
              @if (errors.password) {
                <span class="error">{{ errors.password }}</span>
              }
            </div>

            <div class="form-group">
              <label for="lastName">Last name</label>
              <input
                type="text"
                id="lastName"
                [(ngModel)]="userData.lastName"
                name="lastName"
                placeholder="Your last name">
            </div>

            <div class="form-group">
              <label for="firstName">First name</label>
              <input
                type="text"
                id="firstName"
                [(ngModel)]="userData.firstName"
                name="firstName"
                placeholder="Your first name">
            </div>

            <div class="info-box">
              <p>✓ You will receive 20 credits upon registration</p>
              <p>✓ You can become a driver from your profile</p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%;"
              [disabled]="loading">
              {{ loading ? 'Registering...' : 'Sign up' }}
            </button>
          </form>

          <p class="text-center mt-3">
            Already have an account?
            <a routerLink="/login">Login</a>
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

  errors: any = {};
  error = '';
  success = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.errors = {};
    this.error = '';
    this.success = '';
    this.loading = true;

    // Validation
    if (this.userData.username.length < 3) {
      this.errors.username = 'Username must contain at least 3 characters';
      this.loading = false;
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.userData.password)) {
      this.errors.password = 'Password does not meet security requirements';
      this.loading = false;
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.success = 'Registration successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration error';
        this.loading = false;
      }
    });
  }
}
