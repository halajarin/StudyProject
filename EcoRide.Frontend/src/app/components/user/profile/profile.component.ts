import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CovoiturageService } from '../../../services/covoiturage.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>Mon Espace</h1>

      @if (user) {
        <div class="grid grid-2">
          <div class="card">
            <h2>Mon Profil</h2>
            <div class="profile-info">
              <p><strong>Pseudo:</strong> {{ user.pseudo }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Crédits:</strong> <span class="credit-amount">{{ user.credit }}</span></p>
              <p><strong>Note moyenne:</strong> ⭐ {{ user.noteMoyenne.toFixed(1) }} ({{ user.nombreAvis }} avis)</p>
              <p><strong>Rôles:</strong> {{ user.roles.join(', ') }}</p>
            </div>

            <div class="role-section">
              <h3>Devenir chauffeur</h3>
              @if (!user.roles.includes('Chauffeur')) {
                <button (click)="becomeDriver()" class="btn btn-primary">
                  Ajouter le rôle Chauffeur
                </button>
              } @else {
                <p class="badge badge-success">Vous êtes déjà chauffeur</p>
              }
            </div>
          </div>

          <div class="card">
            <h2>Mes Véhicules</h2>
            @if (vehicles.length > 0) {
              @for (vehicle of vehicles; track vehicle.voitureId) {
                <div class="vehicle-card">
                  <h4>{{ vehicle.marqueLibelle }} {{ vehicle.modele }}</h4>
                  <p>{{ vehicle.immatriculation }} - {{ vehicle.energie }}</p>
                  <p>{{ vehicle.nombrePlaces }} places - {{ vehicle.couleur }}</p>
                </div>
              }
            } @else {
              <p>Aucun véhicule enregistré</p>
            }

            @if (user.roles.includes('Chauffeur')) {
              <button (click)="showAddVehicle = !showAddVehicle" class="btn btn-secondary mt-2">
                {{ showAddVehicle ? 'Annuler' : 'Ajouter un véhicule' }}
              </button>

              @if (showAddVehicle) {
                <form (ngSubmit)="addVehicle()" class="mt-2">
                  <div class="form-group">
                    <label>Marque</label>
                    <select [(ngModel)]="newVehicle.marqueId" name="marqueId" required>
                      <option value="">Sélectionner...</option>
                      <option value="1">Renault</option>
                      <option value="2">Peugeot</option>
                      <option value="3">Citroën</option>
                      <option value="4">Tesla</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Modèle</label>
                    <input type="text" [(ngModel)]="newVehicle.modele" name="modele" required>
                  </div>
                  <div class="form-group">
                    <label>Immatriculation</label>
                    <input type="text" [(ngModel)]="newVehicle.immatriculation" name="immatriculation" required>
                  </div>
                  <div class="form-group">
                    <label>Énergie</label>
                    <select [(ngModel)]="newVehicle.energie" name="energie" required>
                      <option value="Essence">Essence</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electrique">Électrique</option>
                      <option value="Hybride">Hybride</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Couleur</label>
                    <input type="text" [(ngModel)]="newVehicle.couleur" name="couleur" required>
                  </div>
                  <div class="form-group">
                    <label>Nombre de places</label>
                    <input type="number" [(ngModel)]="newVehicle.nombrePlaces" name="nombrePlaces" min="1" max="8" required>
                  </div>
                  <button type="submit" class="btn btn-primary">Enregistrer</button>
                </form>
              }
            }
          </div>
        </div>

        @if (user.roles.includes('Chauffeur')) {
          <div class="card mt-3">
            <h2>Actions Chauffeur</h2>
            <a routerLink="/create-covoiturage" class="btn btn-primary">
              ➕ Créer un nouveau covoiturage
            </a>
          </div>
        }

        <div class="card mt-3">
          <h2>Mes Covoiturages</h2>
          @if (loading) {
            <p>Chargement...</p>
          } @else {
            <div class="trips-section">
              <h3>En tant que chauffeur</h3>
              @if (myTrips.asDriver && myTrips.asDriver.length > 0) {
                @for (trip of myTrips.asDriver; track trip.covoiturageId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.villeDepart }} → {{ trip.villeArrivee }}</strong></p>
                    <p>{{ trip.dateDepart | date:'dd/MM/yyyy' }} - {{ trip.statut }}</p>
                  </div>
                }
              } @else {
                <p>Aucun trajet en tant que chauffeur</p>
              }

              <h3 class="mt-2">En tant que passager</h3>
              @if (myTrips.asPassenger && myTrips.asPassenger.length > 0) {
                @for (trip of myTrips.asPassenger; track trip.covoiturageId) {
                  <div class="trip-card">
                    <p><strong>{{ trip.villeDepart }} → {{ trip.villeArrivee }}</strong></p>
                    <p>{{ trip.dateDepart | date:'dd/MM/yyyy' }} - {{ trip.statut }}</p>
                  </div>
                }
              } @else {
                <p>Aucun trajet en tant que passager</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-info p {
      margin: 0.8rem 0;
    }

    .credit-amount {
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--primary-green);
    }

    .role-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--light-gray);
    }

    .vehicle-card {
      background-color: var(--light-gray);
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 5px;
    }

    .trip-card {
      background-color: var(--very-light-green);
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 5px;
    }

    .trips-section h3 {
      margin-top: 1.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  vehicles: any[] = [];
  myTrips: any = { asDriver: [], asPassenger: [] };
  loading = true;
  showAddVehicle = false;
  newVehicle: any = {
    marqueId: '',
    modele: '',
    immatriculation: '',
    energie: '',
    couleur: '',
    nombrePlaces: 4
  };

  constructor(
    private userService: UserService,
    private covoiturageService: CovoiturageService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadVehicles();
    this.loadMyTrips();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadVehicles() {
    this.userService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadMyTrips() {
    this.covoiturageService.getMyTrips().subscribe({
      next: (data) => {
        this.myTrips = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  becomeDriver() {
    this.userService.addRole(2).subscribe({
      next: () => {
        alert('Vous êtes maintenant chauffeur !');
        this.loadProfile();
      },
      error: (err) => console.error(err)
    });
  }

  addVehicle() {
    this.userService.addVehicle(this.newVehicle).subscribe({
      next: () => {
        alert('Véhicule ajouté avec succès');
        this.showAddVehicle = false;
        this.loadVehicles();
      },
      error: (err) => console.error(err)
    });
  }
}
