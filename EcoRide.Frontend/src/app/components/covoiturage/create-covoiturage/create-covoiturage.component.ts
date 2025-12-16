import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CovoiturageService } from '../../../services/covoiturage.service';
import { UserService } from '../../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-covoiturage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Créer un covoiturage</h1>

      @if (error) {
        <div class="alert alert-danger">{{ error }}</div>
      }

      @if (success) {
        <div class="alert alert-success">{{ success }}</div>
      }

      <div class="card">
        <form (ngSubmit)="createTrip()">
          <div class="grid grid-2">
            <div class="form-group">
              <label>Ville de départ *</label>
              <input type="text" [(ngModel)]="trip.villeDepart" name="villeDepart" required>
            </div>

            <div class="form-group">
              <label>Lieu de départ *</label>
              <input type="text" [(ngModel)]="trip.lieuDepart" name="lieuDepart"
                     placeholder="Ex: Gare Montparnasse" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Ville d'arrivée *</label>
              <input type="text" [(ngModel)]="trip.villeArrivee" name="villeArrivee" required>
            </div>

            <div class="form-group">
              <label>Lieu d'arrivée *</label>
              <input type="text" [(ngModel)]="trip.lieuArrivee" name="lieuArrivee"
                     placeholder="Ex: Gare de Lyon" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Date de départ *</label>
              <input type="date" [(ngModel)]="trip.dateDepart" name="dateDepart" required>
            </div>

            <div class="form-group">
              <label>Heure de départ *</label>
              <input type="time" [(ngModel)]="trip.heureDepart" name="heureDepart" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Date d'arrivée *</label>
              <input type="date" [(ngModel)]="trip.dateArrivee" name="dateArrivee" required>
            </div>

            <div class="form-group">
              <label>Heure d'arrivée *</label>
              <input type="time" [(ngModel)]="trip.heureArrivee" name="heureArrivee" required>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Nombre de places *</label>
              <input type="number" [(ngModel)]="trip.nbPlace" name="nbPlace" min="1" max="8" required>
            </div>

            <div class="form-group">
              <label>Prix par personne (crédits) *</label>
              <input type="number" [(ngModel)]="trip.prixPersonne" name="prixPersonne"
                     min="2" required>
              <small>Minimum 2 crédits (commission plateforme)</small>
            </div>
          </div>

          <div class="grid grid-2">
            <div class="form-group">
              <label>Véhicule *</label>
              <select [(ngModel)]="trip.voitureId" name="voitureId" required>
                <option value="">Sélectionner un véhicule</option>
                @for (vehicle of vehicles; track vehicle.voitureId) {
                  <option [value]="vehicle.voitureId">
                    {{ vehicle.marqueLibelle }} {{ vehicle.modele }} ({{ vehicle.immatriculation }})
                  </option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Durée estimée (minutes)</label>
              <input type="number" [(ngModel)]="trip.dureeEstimeeMinutes" name="dureeEstimeeMinutes" min="1">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Création...' : 'Créer le covoiturage' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 2rem auto;
    }

    small {
      display: block;
      color: var(--gray);
      margin-top: 0.3rem;
    }
  `]
})
export class CreateCovoiturageComponent implements OnInit {
  trip: any = {
    villeDepart: '',
    lieuDepart: '',
    villeArrivee: '',
    lieuArrivee: '',
    dateDepart: '',
    heureDepart: '',
    dateArrivee: '',
    heureArrivee: '',
    nbPlace: 3,
    prixPersonne: 20,
    voitureId: '',
    dureeEstimeeMinutes: null
  };

  vehicles: any[] = [];
  error = '';
  success = '';
  loading = false;

  constructor(
    private covoiturageService: CovoiturageService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        if (this.vehicles.length === 0) {
          this.error = 'Vous devez d\'abord ajouter un véhicule dans votre profil.';
        }
      },
      error: (err) => console.error(err)
    });
  }

  createTrip() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.covoiturageService.create(this.trip).subscribe({
      next: () => {
        this.success = 'Covoiturage créé avec succès ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
      }
    });
  }
}
