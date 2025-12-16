import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CovoiturageService } from '../../../services/covoiturage.service';
import { AuthService } from '../../../services/auth.service';
import { Covoiturage } from '../../../models/covoiturage.model';

@Component({
  selector: 'app-covoiturage-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading">Chargement...</div>
      }

      @if (covoiturage) {
        <div class="detail-card card">
          <div class="header">
            <h1>{{ covoiturage.villeDepart }} → {{ covoiturage.villeArrivee }}</h1>
            <span class="badge badge-{{ getStatusClass() }}">{{ covoiturage.statut }}</span>
          </div>

          <div class="trip-info grid grid-2">
            <div>
              <h3>Départ</h3>
              <p><strong>{{ covoiturage.lieuDepart }}</strong></p>
              <p>{{ covoiturage.dateDepart | date:'dd/MM/yyyy' }} à {{ covoiturage.heureDepart }}</p>
            </div>
            <div>
              <h3>Arrivée</h3>
              <p><strong>{{ covoiturage.lieuArrivee }}</strong></p>
              <p>{{ covoiturage.dateArrivee | date:'dd/MM/yyyy' }} à {{ covoiturage.heureArrivee }}</p>
            </div>
          </div>

          <div class="driver-section">
            <h3>Conducteur</h3>
            <div class="driver-card">
              <div>
                <h4>{{ covoiturage.pseudoChauffeur }}</h4>
                <p class="rating">⭐ {{ covoiturage.noteMoyenneChauffeur.toFixed(1) }}/5</p>
              </div>
            </div>
          </div>

          <div class="vehicle-section">
            <h3>Véhicule</h3>
            <div class="vehicle-info">
              <p><strong>{{ covoiturage.marqueVoiture }} {{ covoiturage.modeleVoiture }}</strong></p>
              <p>Couleur: {{ covoiturage.couleurVoiture }}</p>
              <p>Énergie: {{ covoiturage.energieVoiture }}
                @if (covoiturage.estEcologique) {
                  <span class="badge badge-eco">🔋 Électrique</span>
                }
              </p>
            </div>
          </div>

          <div class="details-grid grid grid-2">
            <div class="detail-item">
              <span class="label">Places disponibles:</span>
              <span class="value">{{ covoiturage.nbPlaceRestante }} / {{ covoiturage.nbPlace }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Prix:</span>
              <span class="value price">{{ covoiturage.prixPersonne }} crédits</span>
            </div>
            @if (covoiturage.dureeEstimeeMinutes) {
              <div class="detail-item">
                <span class="label">Durée estimée:</span>
                <span class="value">{{ covoiturage.dureeEstimeeMinutes }} minutes</span>
              </div>
            }
          </div>

          @if (authService.isLoggedIn && covoiturage.nbPlaceRestante > 0 && covoiturage.statut === 'En attente') {
            <div class="action-section">
              <button (click)="participate()" class="btn btn-primary" [disabled]="participating">
                {{ participating ? 'Participation en cours...' : 'Participer à ce covoiturage' }}
              </button>
            </div>
          } @else if (!authService.isLoggedIn) {
            <div class="alert alert-info">
              <p>Vous devez être connecté pour participer à ce covoiturage.</p>
              <a routerLink="/login" class="btn btn-primary">Se connecter</a>
            </div>
          }

          @if (message) {
            <div class="alert" [class]="messageType">{{ message }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-card {
      max-width: 900px;
      margin: 2rem auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--light-gray);
    }

    .trip-info {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: var(--very-light-green);
      border-radius: 10px;
    }

    .driver-section, .vehicle-section {
      margin-bottom: 2rem;
    }

    .driver-card {
      background-color: var(--light-gray);
      padding: 1rem;
      border-radius: 10px;
    }

    .rating {
      color: var(--warning);
      font-size: 1.1rem;
    }

    .vehicle-info {
      background-color: var(--light-gray);
      padding: 1rem;
      border-radius: 10px;
    }

    .details-grid {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: var(--very-light-green);
      border-radius: 10px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .label {
      font-weight: 500;
      color: var(--dark-green);
    }

    .value {
      font-weight: bold;
    }

    .price {
      font-size: 1.3rem;
      color: var(--primary-green);
    }

    .action-section {
      margin-top: 2rem;
      text-align: center;
    }

    .action-section button {
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }

    .badge-success { background-color: var(--primary-green); }
    .badge-warning { background-color: var(--warning); }
    .badge-info { background-color: var(--info); }
  `]
})
export class CovoiturageDetailComponent implements OnInit {
  covoiturage: Covoiturage | null = null;
  loading = true;
  participating = false;
  message = '';
  messageType = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private covoiturageService: CovoiturageService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCovoiturage(parseInt(id));
    }
  }

  loadCovoiturage(id: number) {
    this.covoiturageService.getById(id).subscribe({
      next: (data) => {
        this.covoiturage = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.message = 'Erreur lors du chargement du covoiturage';
        this.messageType = 'alert-danger';
      }
    });
  }

  participate() {
    if (!this.covoiturage) return;

    if (confirm(`Voulez-vous vraiment participer à ce covoiturage pour ${this.covoiturage.prixPersonne} crédits ?`)) {
      this.participating = true;

      this.covoiturageService.participate(this.covoiturage.covoiturageId).subscribe({
        next: (response) => {
          this.message = 'Participation confirmée ! Vous pouvez voir vos trajets dans votre espace.';
          this.messageType = 'alert-success';
          this.participating = false;
          this.loadCovoiturage(this.covoiturage!.covoiturageId);
        },
        error: (err) => {
          this.message = err.error?.message || 'Erreur lors de la participation';
          this.messageType = 'alert-danger';
          this.participating = false;
        }
      });
    }
  }

  getStatusClass() {
    switch(this.covoiturage?.statut) {
      case 'En attente': return 'info';
      case 'En cours': return 'warning';
      case 'Terminé': return 'success';
      default: return 'info';
    }
  }
}
