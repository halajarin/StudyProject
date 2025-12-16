import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CovoiturageService } from '../../../services/covoiturage.service';
import { Covoiturage, SearchCovoiturage } from '../../../models/covoiturage.model';

@Component({
  selector: 'app-covoiturage-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>Rechercher un covoiturage</h1>

      <div class="card search-section">
        <form (ngSubmit)="search()">
          <div class="grid grid-3">
            <div class="form-group">
              <label>Ville de départ</label>
              <input type="text" [(ngModel)]="searchForm.villeDepart" name="villeDepart" required>
            </div>
            <div class="form-group">
              <label>Ville d'arrivée</label>
              <input type="text" [(ngModel)]="searchForm.villeArrivee" name="villeArrivee" required>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="searchForm.dateDepart" name="dateDepart" required>
            </div>
          </div>

          <div class="filters">
            <h3>Filtres</h3>
            <div class="grid grid-3">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="searchForm.estEcologique" name="estEcologique">
                  Véhicules électriques uniquement
                </label>
              </div>
              <div class="form-group">
                <label>Prix maximum (crédits)</label>
                <input type="number" [(ngModel)]="searchForm.prixMax" name="prixMax" min="0">
              </div>
              <div class="form-group">
                <label>Note minimale</label>
                <select [(ngModel)]="searchForm.noteMinimale" name="noteMinimale">
                  <option [ngValue]="undefined">Toutes</option>
                  <option [ngValue]="3">3 étoiles minimum</option>
                  <option [ngValue]="4">4 étoiles minimum</option>
                  <option [ngValue]="5">5 étoiles uniquement</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Rechercher</button>
        </form>
      </div>

      @if (loading) {
        <div class="loading">Recherche en cours...</div>
      }

      @if (covoiturages.length > 0) {
        <div class="results">
          <h2>{{ covoiturages.length }} trajet(s) trouvé(s)</h2>

          @for (cov of covoiturages; track cov.covoiturageId) {
            <div class="covoiturage-card card">
              <div class="card-header">
                <div class="route">
                  <h3>{{ cov.villeDepart }} → {{ cov.villeArrivee }}</h3>
                  <p class="date">{{ cov.dateDepart | date:'dd/MM/yyyy' }} à {{ cov.heureDepart }}</p>
                </div>
                <div class="price">
                  <span class="amount">{{ cov.prixPersonne }}</span> crédits
                </div>
              </div>

              <div class="card-body">
                <div class="driver-info">
                  <div class="driver-name">
                    <strong>{{ cov.pseudoChauffeur }}</strong>
                    <span class="rating">⭐ {{ cov.noteMoyenneChauffeur.toFixed(1) }}</span>
                  </div>
                  <div class="car-info">
                    {{ cov.marqueVoiture }} {{ cov.modeleVoiture }} - {{ cov.couleurVoiture }}
                    @if (cov.estEcologique) {
                      <span class="badge badge-eco">🔋 Électrique</span>
                    }
                  </div>
                </div>

                <div class="trip-details">
                  <span>{{ cov.nbPlaceRestante }} place(s) disponible(s)</span>
                  @if (cov.dureeEstimeeMinutes) {
                    <span>Durée: {{ cov.dureeEstimeeMinutes }} min</span>
                  }
                </div>
              </div>

              <div class="card-footer">
                <a [routerLink]="['/covoiturage', cov.covoiturageId]" class="btn btn-primary">Voir détails</a>
              </div>
            </div>
          }
        </div>
      } @else if (!loading && searched) {
        <div class="alert alert-info">
          <p>Aucun covoiturage trouvé pour ces critères.</p>
          <p>Essayez de modifier votre recherche ou de choisir une autre date.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-section {
      margin-bottom: 2rem;
    }

    .filters {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--light-gray);
    }

    .results {
      margin-top: 2rem;
    }

    .covoiturage-card {
      margin-bottom: 1.5rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--light-gray);
    }

    .route h3 {
      margin: 0;
      color: var(--dark-green);
    }

    .date {
      color: var(--gray);
      margin: 0.5rem 0 0 0;
    }

    .price {
      text-align: right;
    }

    .amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-green);
    }

    .driver-info {
      margin-bottom: 1rem;
    }

    .driver-name {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .rating {
      color: var(--warning);
    }

    .car-info {
      color: var(--gray);
      font-size: 0.9rem;
    }

    .trip-details {
      display: flex;
      gap: 2rem;
      color: var(--gray);
      font-size: 0.9rem;
    }

    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
      text-align: right;
    }
  `]
})
export class CovoiturageListComponent implements OnInit {
  searchForm: SearchCovoiturage = {
    villeDepart: '',
    villeArrivee: '',
    dateDepart: new Date()
  };

  covoiturages: Covoiturage[] = [];
  loading = false;
  searched = false;

  constructor(
    private covoiturageService: CovoiturageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['villeDepart']) {
        this.searchForm.villeDepart = params['villeDepart'];
        this.searchForm.villeArrivee = params['villeArrivee'];
        this.searchForm.dateDepart = new Date(params['dateDepart']);
        this.search();
      }
    });
  }

  search() {
    this.loading = true;
    this.searched = true;

    this.covoiturageService.search(this.searchForm).subscribe({
      next: (results) => {
        this.covoiturages = results;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
