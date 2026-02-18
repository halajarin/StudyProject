import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    @if (visible()) {
      <div class="cookie-banner">
        <div class="cookie-content">
          <p>
            {{ 'cookies.banner_text' | translate }}
            <a routerLink="/legal-notice">{{ 'cookies.learn_more' | translate }}</a>
          </p>
          <button class="btn-accept" (click)="accept()">{{ 'cookies.accept' | translate }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 1rem 1.5rem;
    }

    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .cookie-content p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .cookie-content a {
      color: var(--primary-green);
      text-decoration: underline;
      white-space: nowrap;
    }

    .btn-accept {
      background: var(--primary-green);
      color: #fff;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .btn-accept:hover {
      background: var(--light-green);
      color: var(--dark-green);
    }

    @media (max-width: 600px) {
      .cookie-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CookieConsentComponent {
  private static readonly STORAGE_KEY = 'ecoride_cookies_accepted';

  visible = signal(!localStorage.getItem(CookieConsentComponent.STORAGE_KEY));

  accept() {
    localStorage.setItem(CookieConsentComponent.STORAGE_KEY, 'true');
    this.visible.set(false);
  }
}
