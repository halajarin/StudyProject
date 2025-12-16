import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carpool, SearchCarpool, CreateCarpool } from '../models/carpool.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarpoolService {
  private apiUrl = `${environment.apiUrl}/carpool`;

  constructor(private http: HttpClient) {}

  search(searchData: SearchCarpool): Observable<Carpool[]> {
    return this.http.post<Carpool[]>(`${this.apiUrl}/search`, searchData);
  }

  getById(id: number): Observable<Carpool> {
    return this.http.get<Carpool>(`${this.apiUrl}/${id}`);
  }

  create(carpool: CreateCarpool): Observable<any> {
    return this.http.post(this.apiUrl, carpool);
  }

  participate(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/participate`, {});
  }

  cancel(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {});
  }

  start(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/start`, {});
  }

  complete(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {});
  }

  getMyTrips(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-trips`);
  }
}
