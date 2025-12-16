import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Espace Employé</h1>

      <div class="card">
        <h2>Avis en attente de validation</h2>
        @if (pendingAvis.length > 0) {
          @for (avis of pendingAvis; track avis.avisId) {
            <div class="avis-card">
              <div class="avis-header">
                <h4>{{ avis.pseudoAuteur }} → {{ avis.pseudoCible }}</h4>
                <span class="rating">Note: {{ avis.note }}/5</span>
              </div>
              <p>{{ avis.commentaire }}</p>
              <div class="avis-actions">
                <button (click)="validateAvis(avis.avisId)" class="btn btn-primary">
                  Valider
                </button>
                <button (click)="rejectAvis(avis.avisId)" class="btn btn-danger">
                  Refuser
                </button>
              </div>
            </div>
          }
        } @else {
          <p>Aucun avis en attente</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .avis-card {
      background-color: var(--very-light-green);
      padding: 1.5rem;
      margin: 1rem 0;
      border-radius: 10px;
    }

    .avis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .rating {
      color: var(--warning);
      font-weight: bold;
    }

    .avis-actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  pendingAvis: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPendingAvis();
  }

  loadPendingAvis() {
    this.http.get<any[]>(`${environment.apiUrl}/avis/pending`).subscribe({
      next: (data) => this.pendingAvis = data,
      error: (err) => console.error(err)
    });
  }

  validateAvis(id: number) {
    this.http.put(`${environment.apiUrl}/avis/${id}/validate`, {}).subscribe({
      next: () => {
        alert('Avis validé');
        this.loadPendingAvis();
      },
      error: (err) => console.error(err)
    });
  }

  rejectAvis(id: number) {
    this.http.put(`${environment.apiUrl}/avis/${id}/reject`, {}).subscribe({
      next: () => {
        alert('Avis refusé');
        this.loadPendingAvis();
      },
      error: (err) => console.error(err)
    });
  }
}
