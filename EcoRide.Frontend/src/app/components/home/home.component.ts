import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="hero">
      <div class="container">
        <h1>Welcome to EcoRide</h1>
        <p class="subtitle">The eco-friendly carpooling platform for your travels</p>

        <div class="search-box card">
          <h2>Find your ride</h2>
          <form (ngSubmit)="searchTrip()">
            <div class="search-fields">
              <div class="form-group">
                <label for="departureCity">Departure city</label>
                <input
                  type="text"
                  id="departureCity"
                  [(ngModel)]="searchForm.departureCity"
                  name="departureCity"
                  placeholder="Ex: Paris"
                  required>
              </div>

              <div class="form-group">
                <label for="arrivalCity">Arrival city</label>
                <input
                  type="text"
                  id="arrivalCity"
                  [(ngModel)]="searchForm.arrivalCity"
                  name="arrivalCity"
                  placeholder="Ex: Lyon"
                  required>
              </div>

              <div class="form-group">
                <label for="departureDate">Date</label>
                <input
                  type="date"
                  id="departureDate"
                  [(ngModel)]="searchForm.departureDate"
                  name="departureDate"
                  required>
              </div>

              <button type="submit" class="btn btn-primary">Search</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container">
      <section class="features">
        <h2 class="text-center">Why choose EcoRide?</h2>
        <div class="grid grid-3">
          <div class="feature-card card">
            <div class="icon">🌱</div>
            <h3>Eco-friendly</h3>
            <p>Reduce your carbon footprint by sharing your trips</p>
          </div>

          <div class="feature-card card">
            <div class="icon">💰</div>
            <h3>Economical</h3>
            <p>Share travel costs and save on your trips</p>
          </div>

          <div class="feature-card card">
            <div class="icon">👥</div>
            <h3>Social</h3>
            <p>Meet new people and travel together</p>
          </div>
        </div>
      </section>

      <section class="about">
        <h2 class="text-center">About EcoRide</h2>
        <p class="text-center">
          EcoRide is a carpooling platform that encourages eco-friendly travel.
          Our mission is to reduce the environmental impact of transportation by facilitating
          vehicle sharing between individuals.
        </p>
        <div class="grid grid-2 mt-3">
          <div class="about-image">
            <div class="placeholder-image">🚗💚</div>
          </div>
          <div class="about-text">
            <h3>Our ecological commitment</h3>
            <p>
              We highlight trips made with electric vehicles
              and encourage more responsible mobility. Every shared trip is
              a step towards a greener future.
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
    this.router.navigate(['/carpools'], {
      queryParams: this.searchForm
    });
  }
}
