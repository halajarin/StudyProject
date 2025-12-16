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
          <h2 class="text-center">Créer un compte EcoRide</h2>

          @if (error) {
            <div class="alert alert-danger">{{ error }}</div>
          }

          @if (success) {
            <div class="alert alert-success">{{ success }}</div>
          }

          <form (ngSubmit)="register()">
            <div class="form-group">
              <label for="pseudo">Pseudo *</label>
              <input
                type="text"
                id="pseudo"
                [(ngModel)]="userData.pseudo"
                name="pseudo"
                placeholder="Votre pseudo"
                required
                minlength="3">
              @if (errors.pseudo) {
                <span class="error">{{ errors.pseudo }}</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="userData.email"
                name="email"
                placeholder="votre@email.com"
                required>
            </div>

            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                [(ngModel)]="userData.password"
                name="password"
                placeholder="Minimum 8 caractères"
                required
                minlength="8">
              <small>Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial</small>
              @if (errors.password) {
                <span class="error">{{ errors.password }}</span>
              }
            </div>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                [(ngModel)]="userData.nom"
                name="nom"
                placeholder="Votre nom">
            </div>

            <div class="form-group">
              <label for="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                [(ngModel)]="userData.prenom"
                name="prenom"
                placeholder="Votre prénom">
            </div>

            <div class="info-box">
              <p>✓ Vous recevrez 20 crédits à l'inscription</p>
              <p>✓ Vous pourrez devenir chauffeur depuis votre espace</p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%;"
              [disabled]="loading">
              {{ loading ? 'Inscription...' : 'S\'inscrire' }}
            </button>
          </form>

          <p class="text-center mt-3">
            Déjà un compte ?
            <a routerLink="/login">Se connecter</a>
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
    pseudo: '',
    email: '',
    password: '',
    nom: '',
    prenom: ''
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
    if (this.userData.pseudo.length < 3) {
      this.errors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
      this.loading = false;
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.userData.password)) {
      this.errors.password = 'Le mot de passe ne respecte pas les critères de sécurité';
      this.loading = false;
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.success = 'Inscription réussie ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
