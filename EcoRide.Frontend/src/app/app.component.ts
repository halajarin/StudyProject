import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/role.enum';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { IconComponent } from './components/shared/icon/icon.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSelectorComponent, IconComponent, CookieConsentComponent],
  template: `
    <nav class="navbar">
      <div class="container nav-container">
        <div class="nav-brand">
          <a routerLink="/" class="logo">
            <img src="assets/ecoride-logo.svg" alt="EcoRide" class="logo-img" />
          </a>
        </div>
        <button class="hamburger" [class.open]="menuOpen()" (click)="toggleMenu($event)" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-overlay" [class.visible]="menuOpen()" (click)="closeMenu()"></div>
        <ul class="nav-menu" [class.show]="menuOpen()" (click)="$event.stopPropagation()">
          <li class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <app-icon name="home" class="nav-icon" />
              {{ 'common.home' | translate }}
            </a>
          </li>
          <li class="nav-links">
            <a routerLink="/carpools" routerLinkActive="active">
              <app-icon name="route" class="nav-icon" />
              {{ 'navigation.carpools' | translate }}
            </a>
          </li>

          @if (authService.isLoggedIn()) {
            <li class="nav-links">
              <a routerLink="/my-trips" routerLinkActive="active">
                <app-icon name="car" class="nav-icon" />
                {{ 'navigation.my_trips' | translate }}
              </a>
            </li>

            <li class="nav-links">
              <a routerLink="/profile" routerLinkActive="active">
                <app-icon name="user" class="nav-icon" />
                {{ 'navigation.my_profile' | translate }}
              </a>
            </li>

            <li class="nav-links">
              <a routerLink="/reviews" routerLinkActive="active">
                <app-icon name="star" class="nav-icon" />
                {{ 'navigation.reviews' | translate }}
              </a>
            </li>

            @if (authService.hasRole(UserRole.Administrator)) {
              <li class="nav-links">
                <a routerLink="/admin" routerLinkActive="active">
                  <app-icon name="settings" class="nav-icon" />
                  {{ 'navigation.admin' | translate }}
                </a>
              </li>
            }

            <li class="nav-separator"></li>

            <li class="nav-actions">
              <span class="credit-badge">
                <app-icon name="coin" [size]="14" class="nav-icon" />
                {{ authService.currentUserValue?.credits }} {{ 'common.credits' | translate }}
              </span>
            </li>
            <li class="nav-actions">
              <button class="btn-logout" (click)="authService.logout()">{{ 'common.logout' | translate }}</button>
            </li>
          } @else {
            <li class="nav-separator"></li>
            <li class="nav-actions">
              <a routerLink="/login" routerLinkActive="active">{{ 'common.login' | translate }}</a>
            </li>
            <li class="nav-actions">
              <a routerLink="/register" class="btn-register">{{ 'navigation.sign_up' | translate }}</a>
            </li>
          }

          <li class="nav-actions">
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

    <app-cookie-consent />
  `,
  styles: [`
    /* ===== NAVBAR BASE ===== */
    .navbar {
      background-color: var(--dark-green);
      padding: 0.8rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      text-decoration: none;
      display: flex;
      align-items: center;
    }

    .logo-img {
      height: 38px;
      width: auto;
    }

    /* ===== NAV ICONS ===== */
    .nav-icon {
      vertical-align: -2px;
      flex-shrink: 0;
    }

    /* ===== HAMBURGER ===== */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      z-index: 120;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 2.5px;
      background-color: var(--white);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.2s ease;
      transform-origin: center;
    }

    .hamburger.open span:nth-child(1) {
      transform: translateY(7.5px) rotate(45deg);
    }

    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.open span:nth-child(3) {
      transform: translateY(-7.5px) rotate(-45deg);
    }

    /* ===== OVERLAY ===== */
    .nav-overlay {
      display: none;
    }

    /* ===== NAV MENU (desktop) ===== */
    .nav-menu {
      display: flex;
      flex: 1;
      list-style: none;
      gap: 0.3rem;
      align-items: center;
      justify-content: flex-end;
      margin: 0;
      padding: 0;
    }

    .nav-separator {
      display: none;
    }

    .nav-links a {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .nav-menu a {
      color: var(--white);
      text-decoration: none;
      transition: background-color 0.2s;
      padding: 0.4rem 0.7rem;
      border-radius: 5px;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      background-color: rgba(255,255,255,0.15);
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
      transition: all 0.2s;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .btn-logout:hover {
      background-color: var(--white);
      color: var(--dark-green);
    }

    .credit-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background-color: var(--primary-green);
      color: var(--white);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    /* ===== MAIN & FOOTER ===== */
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

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1100px) {
      .hamburger {
        display: flex;
      }

      .nav-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 90;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      .nav-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      .nav-menu {
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        max-width: 85vw;
        height: 100vh;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        background-color: var(--dark-green);
        padding: 5rem 1.5rem 2rem;
        gap: 0;
        z-index: 110;
        overflow-y: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }

      .nav-menu.show {
        transform: translateX(0);
      }

      .nav-separator {
        display: block;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.15);
        margin: 0.6rem 0;
      }

      .nav-menu li {
        width: 100%;
      }

      .nav-links a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-menu a {
        display: block;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-radius: 8px;
      }

      .nav-menu a:hover,
      .nav-menu a.active {
        background-color: rgba(255,255,255,0.12);
      }

      .btn-register {
        text-align: center;
        border-radius: 8px;
      }

      .btn-logout {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        text-align: center;
        border-radius: 8px;
      }

      .credit-badge {
        display: flex;
        justify-content: center;
        padding: 0.6rem 1rem;
        font-size: 0.95rem;
        border-radius: 8px;
      }

      .nav-actions {
        margin-top: 0.2rem;
      }
    }
  `]
})
export class AppComponent {
  UserRole = UserRole;
  menuOpen = signal(false);

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.closeMenu();
    });
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeMenu();
  }
}
