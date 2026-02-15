import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/role.enum';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSelectorComponent],
  template: `
    <nav class="navbar">
      <div class="container nav-container">
        <div class="nav-brand">
          <a routerLink="/" class="logo">
            <span class="eco">Eco</span><span class="ride">Ride</span>
          </a>
        </div>
        <button class="hamburger" [class.open]="menuOpen()" (click)="menuOpen.set(!menuOpen())">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-menu" [class.show]="menuOpen()">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">{{ 'common.home' | translate }}</a></li>
          <li><a routerLink="/carpools" routerLinkActive="active">{{ 'navigation.carpools' | translate }}</a></li>

          @if (authService.isLoggedIn()) {
            <li><a routerLink="/profile" routerLinkActive="active">{{ 'navigation.my_profile' | translate }}</a></li>

            @if (authService.hasRole(UserRole.Employee) || authService.hasRole(UserRole.Administrator)) {
              <li><a routerLink="/employee" routerLinkActive="active">{{ 'navigation.employee_dashboard' | translate }}</a></li>
            }

            @if (authService.hasRole(UserRole.Administrator)) {
              <li><a routerLink="/admin" routerLinkActive="active">{{ 'navigation.admin' | translate }}</a></li>
            }

            <li>
              <span class="credit-badge">
                {{ authService.currentUserValue?.credits }} {{ 'common.credits' | translate }}
              </span>
            </li>
            <li><button class="btn-logout" (click)="authService.logout()">{{ 'common.logout' | translate }}</button></li>
          } @else {
            <li><a routerLink="/login" routerLinkActive="active">{{ 'common.login' | translate }}</a></li>
            <li><a routerLink="/register" class="btn-register">{{ 'navigation.sign_up' | translate }}</a></li>
          }

          <li>
            <app-language-selector></app-language-selector>
          </li>
        </ul>
      </div>
    </nav>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 EcoRide - {{ 'footer.copyright' | translate }}</p>
        <p>{{ 'footer.contact' | translate }}: <a href="mailto:contact@ecoride.fr">contact@ecoride.fr</a> | <a routerLink="/legal-notice">{{ 'footer.legal_notice' | translate }}</a></p>
      </div>
    </footer>
  `,
  styles: [`
    .navbar {
      background-color: var(--dark-green);
      padding: 0.8rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .nav-container {
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

    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      z-index: 10;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background-color: var(--white);
      border-radius: 2px;
      transition: transform 0.3s, opacity 0.3s;
    }

    .hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 0.4rem;
      align-items: center;
      margin: 0;
      padding: 0;
    }

    .nav-menu a {
      color: var(--white);
      text-decoration: none;
      transition: color 0.3s;
      padding: 0.4rem 0.7rem;
      border-radius: 5px;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      background-color: rgba(255,255,255,0.1);
    }

    .btn-register {
      background-color: var(--primary-green);
      padding: 0.4rem 1.2rem !important;
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
      padding: 0.4rem 0.8rem;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .btn-logout:hover {
      background-color: var(--white);
      color: var(--dark-green);
    }

    .credit-badge {
      background-color: var(--primary-green);
      color: var(--white);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.85rem;
      white-space: nowrap;
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

    @media (max-width: 1100px) {
      .hamburger {
        display: flex;
      }

      .nav-menu {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--dark-green);
        padding: 1rem;
        gap: 0.3rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9;
      }

      .nav-menu.show {
        display: flex;
      }

      .nav-menu a {
        padding: 0.6rem 1rem;
        font-size: 1rem;
      }

      .btn-logout {
        font-size: 1rem;
        width: 100%;
        text-align: center;
      }

      .navbar {
        position: relative;
      }
    }
  `]
})
export class AppComponent {
  UserRole = UserRole;
  menuOpen = signal(false);

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
    });
  }
}
