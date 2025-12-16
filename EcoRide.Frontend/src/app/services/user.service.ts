import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Vehicle, CreateVehicle, Brand } from '../models/vehicle.model';
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

  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  addRole(roleId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-role/${roleId}`, {});
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`);
  }

  addVehicle(vehicle: CreateVehicle): Observable<any> {
    return this.http.post(`${this.apiUrl}/vehicles`, vehicle);
  }

  getPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/preferences`);
  }

  savePreferences(preferences: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/preferences`, preferences);
  }
}
