import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ReviewDashboardItem } from '../../../interfaces/review-dashboard.interface';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'employee.reviews_title' | translate }}</h1>

      <!-- STAT CARDS -->
      <div class="stats-grid">
        <div class="stat-card stat-card--total">
          <div class="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-label">{{ 'employee.total_reviews' | translate }}</span>
            <span class="stat-value">{{ reviews().length }}</span>
          </div>
        </div>
        <div class="stat-card stat-card--validated">
          <div class="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-label">{{ 'employee.validated_reviews' | translate }}</span>
            <span class="stat-value">{{ validatedCount() }}</span>
          </div>
        </div>
        <div class="stat-card stat-card--rejected">
          <div class="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-label">{{ 'employee.rejected_reviews' | translate }}</span>
            <span class="stat-value">{{ rejectedCount() }}</span>
          </div>
        </div>
        <div class="stat-card stat-card--average">
          <div class="stat-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div class="stat-card-content">
            <span class="stat-label">{{ 'employee.average_rating' | translate }}</span>
            <span class="stat-value">{{ averageRating() }}</span>
          </div>
          @if (validatedCount() > 0) {
            <span class="stat-sub-label">{{ 'employee.min_max_notes' | translate:{ min: minNote(), max: maxNote() } }}</span>
          }
        </div>
      </div>

      <!-- TABLE -->
      <div class="card">
        <div class="table-header">
          <div class="table-header-actions">
            @if (isStaff()) {
              <div class="filter-group">
                <label>{{ 'admin.status_label' | translate }}:</label>
                <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
                  <option value="all">{{ 'admin.filter_all' | translate }}</option>
                  <option value="Pending">{{ 'review.pending_validation' | translate }}</option>
                  <option value="Validated">{{ 'review.validated' | translate }}</option>
                  <option value="Rejected">{{ 'review.rejected' | translate }}</option>
                </select>
              </div>
            }
          </div>
          <span class="result-count">{{ filteredReviews().length }} / {{ reviews().length }}</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="toggleSort('authorUsername')">{{ 'employee.column_passenger' | translate }} {{ getSortArrow('authorUsername') }}</th>
                <th class="sortable" (click)="toggleSort('carpoolId')">{{ 'employee.column_trip_id' | translate }} {{ getSortArrow('carpoolId') }}</th>
                <th class="sortable" (click)="toggleSort('departureDate')">{{ 'employee.column_trip_date' | translate }} {{ getSortArrow('departureDate') }}</th>
                <th class="sortable" (click)="toggleSort('driverUsername')">{{ 'employee.column_driver_vehicle' | translate }} {{ getSortArrow('driverUsername') }}</th>
                <th class="sortable" (click)="toggleSort('note')">{{ 'employee.column_rating' | translate }} {{ getSortArrow('note') }}</th>
                <th>{{ 'employee.column_comment' | translate }}</th>
                <th class="sortable" (click)="toggleSort('status')">{{ 'admin.status_label' | translate }} {{ getSortArrow('status') }}</th>
                @if (isStaff()) {
                  <th>{{ 'common.edit' | translate }}</th>
                }
              </tr>
              <tr class="filter-row">
                <th><input class="column-filter" (input)="setColumnFilter('authorUsername', $event)" placeholder="..."></th>
                <th><input class="column-filter" (input)="setColumnFilter('carpoolId', $event)" placeholder="ID"></th>
                <th><input class="column-filter" (input)="setColumnFilter('departureDate', $event)" placeholder="..."></th>
                <th><input class="column-filter" (input)="setColumnFilter('driverUsername', $event)" placeholder="..."></th>
                <th><input class="column-filter" (input)="setColumnFilter('note', $event)" placeholder="..."></th>
                <th><input class="column-filter" (input)="setColumnFilter('comment', $event)" placeholder="..."></th>
                <th><input class="column-filter" (input)="setColumnFilter('status', $event)" placeholder="..."></th>
                @if (isStaff()) {
                  <th></th>
                }
              </tr>
            </thead>
            <tbody>
              @if (filteredReviews().length === 0) {
                <tr><td [attr.colspan]="isStaff() ? 8 : 7" class="no-results">{{ 'employee.no_reviews' | translate }}</td></tr>
              }
              @for (r of filteredReviews(); track r.reviewId) {
                <tr>
                  <td>{{ r.authorUsername }}</td>
                  <td>{{ r.carpoolId || '-' }}</td>
                  <td class="td-date">{{ r.departureDate ? (r.departureDate | date:'dd/MM/yyyy') : '-' }}</td>
                  <td class="td-driver-vehicle">
                    <div>{{ r.driverUsername }}</div>
                    @if (r.vehicleBrand || r.vehicleModel) {
                      <small class="text-muted">{{ r.vehicleBrand }} {{ r.vehicleModel }}</small>
                    }
                  </td>
                  <td>
                    <span class="rating-badge">{{ r.note }}/5</span>
                  </td>
                  <td class="td-comment">{{ r.comment }}</td>
                  <td>
                    <span class="status-badge status-{{ r.status.toLowerCase() }}">
                      {{ 'review.' + getStatusKey(r.status) | translate }}
                    </span>
                  </td>
                  @if (isStaff()) {
                    <td class="td-actions">
                      @if (r.status === 'Pending') {
                        <button (click)="validateReview(r.reviewId)" class="btn-sm btn-primary">
                          {{ 'admin.validate_review' | translate }}
                        </button>
                        <button (click)="rejectReview(r.reviewId)" class="btn-sm btn-danger">
                          {{ 'admin.reject_review' | translate }}
                        </button>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      gap: 0 0.75rem;
      align-items: center;
      padding: 1rem;
      border-radius: 12px;
      background: white;
      border: 1px solid var(--light-gray);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .stat-card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card--total .stat-card-icon { background: #e3f2fd; color: #1565c0; }
    .stat-card--validated .stat-card-icon { background: #e8f5e9; color: #2e7d32; }
    .stat-card--rejected .stat-card-icon { background: #fce4ec; color: #c62828; }
    .stat-card--average .stat-card-icon { background: #fff8e1; color: #f57f17; }

    .stat-card-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 0.78rem;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      line-height: 1.3;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--black);
      line-height: 1.2;
    }

    .stat-sub-label {
      grid-column: 1 / -1;
      font-size: 0.7rem;
      color: var(--gray);
      font-style: italic;
      line-height: 1.2;
      margin-top: 0.25rem;
    }

    .data-table { min-width: 900px; }

    .td-date {
      white-space: nowrap;
      font-size: 0.82rem;
      color: var(--gray);
    }

    .td-comment {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .td-driver-vehicle {
      white-space: nowrap;
    }

    .td-actions {
      white-space: nowrap;
      display: flex;
      gap: 0.4rem;
    }

    .text-muted {
      font-size: 0.78rem;
    }

    .rating-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.82rem;
      background: #fff8e1;
      color: #f57f17;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  reviews = signal<ReviewDashboardItem[]>([]);
  statusFilter = signal<string>('all');
  sortColumn = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  columnFilters = signal<Record<string, string>>({});

  isStaff = computed(() => this.auth.hasRole('Employee') || this.auth.hasRole('Administrator'));

  private validatedReviews = computed(() => this.reviews().filter(r => r.status === 'Validated'));
  validatedCount = computed(() => this.validatedReviews().length);
  rejectedCount = computed(() => this.reviews().filter(r => r.status === 'Rejected').length);

  averageRating = computed(() => {
    const v = this.validatedReviews();
    if (v.length === 0) return '-';
    return (v.reduce((sum, r) => sum + r.note, 0) / v.length).toFixed(1);
  });

  minNote = computed(() => {
    const v = this.validatedReviews();
    return v.length > 0 ? Math.min(...v.map(r => r.note)) : 0;
  });

  maxNote = computed(() => {
    const v = this.validatedReviews();
    return v.length > 0 ? Math.max(...v.map(r => r.note)) : 0;
  });

  filteredReviews = computed(() => {
    const status = this.statusFilter();
    const filters = this.columnFilters();
    const sortCol = this.sortColumn();
    const sortDir = this.sortDirection();

    let result = this.reviews();

    // Status dropdown filter
    if (status !== 'all') {
      result = result.filter(r => r.status === status);
    }

    // Column filters
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const lower = value.toLowerCase();
      result = result.filter(r => {
        if (key === 'authorUsername') {
          return r.authorUsername.toLowerCase().includes(lower);
        }
        if (key === 'driverUsername') {
          return `${r.driverUsername} ${r.vehicleBrand} ${r.vehicleModel}`.toLowerCase().includes(lower);
        }
        if (key === 'status') {
          const statusKey = this.getStatusKey(r.status);
          const translated = this.translate.instant('review.' + statusKey);
          return translated.toLowerCase().includes(lower) || r.status.toLowerCase().includes(lower);
        }
        const val = (r as any)[key];
        return String(val ?? '').toLowerCase().includes(lower);
      });
    }

    // Sorting
    if (sortCol) {
      result = [...result].sort((a, b) => {
        const valA = (a as any)[sortCol];
        const valB = (b as any)[sortCol];
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        let cmp: number;
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  });

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadReviews();
    const driver = this.route.snapshot.queryParamMap.get('driver');
    if (driver) {
      this.columnFilters.set({ driverUsername: driver });
    }
    const carpoolId = this.route.snapshot.queryParamMap.get('carpoolId');
    if (carpoolId) {
      this.columnFilters.set({ ...this.columnFilters(), carpoolId });
    }
  }

  loadReviews() {
    const endpoint = this.isStaff()
      ? `${environment.apiUrl}/review/dashboard`
      : `${environment.apiUrl}/review/public`;
    this.http.get<ReviewDashboardItem[]>(endpoint).subscribe({
      next: (data) => this.reviews.set(data),
    });
  }

  getStatusKey(status: string): string {
    switch (status) {
      case 'Pending': return 'pending_validation';
      case 'Validated': return 'validated';
      case 'Rejected': return 'rejected';
      default: return status.toLowerCase();
    }
  }

  toggleSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortArrow(column: string): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }

  setColumnFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.columnFilters.set({ ...this.columnFilters(), [column]: value });
  }

  validateReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/validate`, {}).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.loadReviews();
      },
    });
  }

  rejectReview(id: number) {
    this.http.put(`${environment.apiUrl}/review/${id}/reject`, {}).subscribe({
      next: () => {
        alert(this.translate.instant('messages.operation_successful'));
        this.loadReviews();
      },
    });
  }
}
