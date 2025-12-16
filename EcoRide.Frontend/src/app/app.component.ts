import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="container">
        <div class="nav-brand">
          <a routerLink="/" class="logo">
            <span class="eco">Eco</span><span class="ride">Ride</span>
          </a>
        </div>
        <ul class="nav-menu">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Accueil</a></li>
          <li><a routerLink="/covoiturages" routerLinkActive="active">Covoiturages</a></li>

          @if (authService.isLoggedIn) {
            <li><a routerLink="/profile" routerLinkActive="active">Mon espace</a></li>

            @if (authService.hasRole('Employe') || authService.hasRole('Administrateur')) {
              <li><a routerLink="/employee" routerLinkActive="active">Espace Employé</a></li>
            }

            @if (authService.hasRole('Administrateur')) {
              <li><a routerLink="/admin" routerLinkActive="active">Administration</a></li>
            }

            <li>
              <span class="credit-badge">
                {{ authService.currentUserValue?.credit }} crédits
              </span>
            </li>
            <li><button class="btn-logout" (click)="authService.logout()">Déconnexion</button></li>
          } @else {
            <li><a routerLink="/login" routerLinkActive="active">Connexion</a></li>
            <li><a routerLink="/register" class="btn-register">S'inscrire</a></li>
          }
        </ul>
      </div>
    </nav>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 EcoRide - Covoiturage Écologique</p>
        <p>Contact: <a href="mailto:contact@ecoride.fr">contact@ecoride.fr</a> | <a routerLink="/mentions-legales">Mentions légales</a></p>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      background-color: var(--dark-green);
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .navbar .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.8rem;
      font-weight: bold;
      text-decoration: none;
    }

    .eco {
      color: var(--light-green);
    }

    .ride {
      color: var(--white);
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-menu a {
      color: var(--white);
      text-decoration: none;
      transition: color 0.3s;
      padding: 0.5rem 1rem;
      border-radius: 5px;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      background-color: rgba(255,255,255,0.1);
    }

    .btn-register {
      background-color: var(--primary-green);
      padding: 0.5rem 1.5rem !important;
      border-radius: 25px;
    }

    .btn-register:hover {
      background-color: var(--light-green);
      color: var(--dark-green) !important;
    }

    .btn-logout {
      background-color: transparent;
      border: 1px solid var(--white);
      color: var(--white);
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background-color: var(--white);
      color: var(--dark-green);
    }

    .credit-badge {
      background-color: var(--primary-green);
      color: var(--white);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
    }

    main {
      min-height: calc(100vh - 200px);
      padding: 2rem 0;
    }

    .footer {
      background-color: var(--black);
      color: var(--white);
      padding: 2rem 0;
      text-align: center;
    }

    .footer a {
      color: var(--primary-green);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .navbar .container {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-menu {
        flex-direction: column;
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
