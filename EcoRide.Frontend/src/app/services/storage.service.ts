import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser';

  // Reactive signals for token and user
  private tokenSignal = signal<string | null>(this.getToken());
  private userSignal = signal<User | null>(this.getCurrentUser());

  // Read-only accessors
  token = this.tokenSignal.asReadonly();
  currentUser = this.userSignal.asReadonly();

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set token in localStorage and update signal
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  /**
   * Remove token from localStorage and update signal
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Set current user in localStorage and update signal
   */
  setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  /**
   * Remove current user from localStorage and update signal
   */
  removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSignal.set(null);
  }

  /**
   * Clear all auth data (token + user)
   */
  clearAuth(): void {
    this.removeToken();
    this.removeCurrentUser();
  }

  /**
   * Refresh signals from localStorage (useful after external changes)
   */
  refreshSignals(): void {
    this.tokenSignal.set(this.getToken());
    this.userSignal.set(this.getCurrentUser());
  }
}
