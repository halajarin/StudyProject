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
        <h1>Bienvenue sur EcoRide</h1>
        <p class="subtitle">La plateforme de covoiturage écologique pour vos déplacements</p>

        <div class="search-box card">
          <h2>Trouvez votre trajet</h2>
          <form (ngSubmit)="searchTrip()">
            <div class="search-fields">
              <div class="form-group">
                <label for="villeDepart">Ville de départ</label>
                <input
                  type="text"
                  id="villeDepart"
                  [(ngModel)]="searchForm.villeDepart"
                  name="villeDepart"
                  placeholder="Ex: Paris"
                  required>
              </div>

              <div class="form-group">
                <label for="villeArrivee">Ville d'arrivée</label>
                <input
                  type="text"
                  id="villeArrivee"
                  [(ngModel)]="searchForm.villeArrivee"
                  name="villeArrivee"
                  placeholder="Ex: Lyon"
                  required>
              </div>

              <div class="form-group">
                <label for="dateDepart">Date</label>
                <input
                  type="date"
                  id="dateDepart"
                  [(ngModel)]="searchForm.dateDepart"
                  name="dateDepart"
                  required>
              </div>

              <button type="submit" class="btn btn-primary">Rechercher</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="container">
      <section class="features">
        <h2 class="text-center">Pourquoi choisir EcoRide ?</h2>
        <div class="grid grid-3">
          <div class="feature-card card">
            <div class="icon">🌱</div>
            <h3>Écologique</h3>
            <p>Réduisez votre empreinte carbone en partageant vos trajets</p>
          </div>

          <div class="feature-card card">
            <div class="icon">💰</div>
            <h3>Économique</h3>
            <p>Partagez les frais de trajet et économisez sur vos déplacements</p>
          </div>

          <div class="feature-card card">
            <div class="icon">👥</div>
            <h3>Convivial</h3>
            <p>Rencontrez de nouvelles personnes et voyagez ensemble</p>
          </div>
        </div>
      </section>

      <section class="about">
        <h2 class="text-center">À propos d'EcoRide</h2>
        <p class="text-center">
          EcoRide est une plateforme de covoiturage qui encourage les déplacements écologiques.
          Notre mission est de réduire l'impact environnemental des transports en facilitant
          le partage de véhicules entre particuliers.
        </p>
        <div class="grid grid-2 mt-3">
          <div class="about-image">
            <div class="placeholder-image">🚗💚</div>
          </div>
          <div class="about-text">
            <h3>Notre engagement écologique</h3>
            <p>
              Nous mettons en avant les trajets effectués avec des véhicules électriques
              et encourageons une mobilité plus responsable. Chaque trajet partagé est
              un pas vers un avenir plus vert.
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
    villeDepart: '',
    villeArrivee: '',
    dateDepart: ''
  };

  constructor(private router: Router) {}

  searchTrip() {
    this.router.navigate(['/covoiturages'], {
      queryParams: this.searchForm
    });
  }
}
