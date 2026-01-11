import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="hero">
      <div class="container">
        <h1>{{ 'home.hero_title' | translate }}</h1>
        <p class="subtitle">{{ 'home.hero_subtitle' | translate }}</p>

        <div class="search-box card">
          <h2>{{ 'home.search_title' | translate }}</h2>
          <form (ngSubmit)="searchTrip()">
            <div class="search-fields">
              <div class="form-group">
                <label for="departureCity">{{ 'home.departure_city' | translate }}</label>
                <input
                  type="text"
                  id="departureCity"
                  [(ngModel)]="searchForm.departureCity"
                  name="departureCity"
                  [placeholder]="'home.placeholder_departure' | translate"
                  required>
              </div>

              <div class="form-group">
                <label for="arrivalCity">{{ 'home.arrival_city' | translate }}</label>
                <input
                  type="text"
                  id="arrivalCity"
                  [(ngModel)]="searchForm.arrivalCity"
                  name="arrivalCity"
                  [placeholder]="'home.placeholder_arrival' | translate"
                  required>
              </div>

              <div class="form-group">
                <label for="departureDate">{{ 'home.date' | translate }}</label>
                <input
                  type="date"
                  id="departureDate"
                  [(ngModel)]="searchForm.departureDate"
                  name="departureDate">
              </div>

              <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container">
      <section class="features">
        <h2 class="text-center">{{ 'home.why_choose_title' | translate }}</h2>
        <div class="grid grid-3">
          <div class="feature-card card">
            <div class="icon">🌱</div>
            <h3>{{ 'home.feature_eco_title' | translate }}</h3>
            <p>{{ 'home.feature_eco_desc' | translate }}</p>
          </div>

          <div class="feature-card card">
            <div class="icon">💰</div>
            <h3>{{ 'home.feature_economical_title' | translate }}</h3>
            <p>{{ 'home.feature_economical_desc' | translate }}</p>
          </div>

          <div class="feature-card card">
            <div class="icon">👥</div>
            <h3>{{ 'home.feature_social_title' | translate }}</h3>
            <p>{{ 'home.feature_social_desc' | translate }}</p>
          </div>
        </div>
      </section>

      <section class="about">
        <h2 class="text-center">{{ 'home.about_title' | translate }}</h2>
        <p class="text-center">
          {{ 'home.about_description' | translate }}
        </p>
        <div class="grid grid-2 mt-3">
          <div class="about-image">
            <div class="placeholder-image">🚗💚</div>
          </div>
          <div class="about-text">
            <h3>{{ 'home.ecological_commitment_title' | translate }}</h3>
            <p>
              {{ 'home.ecological_commitment_desc' | translate }}
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 100%);
      color: var(--white);
      padding: 4rem 0;
      margin-bottom: 3rem;
    }

    .hero h1 {
      font-size: 3rem;
      color: var(--white);
      text-align: center;
      margin-bottom: 1rem;
    }

    .subtitle {
      text-align: center;
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }

    .search-box {
      max-width: 800px;
      margin: 0 auto;
      background-color: var(--white);
    }

    .search-box h2 {
      color: var(--dark-green);
      margin-bottom: 1.5rem;
    }

    .search-fields {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }

    .features {
      margin: 3rem 0;
    }

    .feature-card {
      text-align: center;
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: var(--primary-green);
    }

    .about {
      margin: 3rem 0;
    }

    .about-image {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-image {
      font-size: 5rem;
      padding: 2rem;
    }

    .about-text h3 {
      color: var(--primary-green);
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }

      .search-fields {
        grid-template-columns: 1fr;
      }

      .search-fields button {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent {
  searchForm = {
    departureCity: '',
    arrivalCity: '',
    departureDate: ''
  };

  constructor(private router: Router) {}

  searchTrip() {
    // Only navigate if required fields are filled (date is optional)
    if (this.searchForm.departureCity && this.searchForm.arrivalCity) {
      this.router.navigate(['/carpools'], {
        queryParams: this.searchForm
      });
    }
  }
}
