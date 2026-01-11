import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Vehicle, CreateVehicle, Brand } from '../models/vehicle.model';
import { UserPreferences } from '../interfaces/user-preferences.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  addRole(roleId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/add-role/${roleId}`, {});
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`);
  }

  addVehicle(vehicle: CreateVehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, vehicle);
  }

  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/preferences`);
  }

  savePreferences(preferences: UserPreferences): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.apiUrl}/preferences`, preferences);
  }
}
