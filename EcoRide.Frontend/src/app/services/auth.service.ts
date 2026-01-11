import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal-based state management
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());

  // Public readonly signal
  public currentUser = this.currentUserSignal.asReadonly();

  // Computed signals for derived state
  public isLoggedIn = computed(() => !!this.currentUserSignal());
  public token = computed(() => localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSignal();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSignal.set(response.user as any);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSignal.set(response.user as any);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user && user.roles ? user.roles.includes(role) : false;
  }

  refreshCurrentUser(): void {
    const user = this.getUserFromStorage();
    this.currentUserSignal.set(user);
  }
}
