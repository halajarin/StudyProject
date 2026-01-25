import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Use StorageService for reactive state
  public currentUser = this.storage.currentUser;
  public token = this.storage.token;

  // Computed signals for derived state
  public isLoggedIn = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {}

  public get currentUserValue(): User | null {
    return this.currentUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.storage.setToken(response.token);
          this.storage.setCurrentUser(response.user as any);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.token) {
          this.storage.setToken(response.token);
          this.storage.setCurrentUser(response.user as any);
        }
      })
    );
  }

  logout(): void {
    this.storage.clearAuth();
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user && user.roles ? user.roles.includes(role) : false;
  }

  refreshCurrentUser(): void {
    this.storage.refreshSignals();
  }
}
