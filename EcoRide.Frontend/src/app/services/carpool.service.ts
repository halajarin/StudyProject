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
  private participationUrl = `${environment.apiUrl}/participation`;

  constructor(private http: HttpClient) {}

  search(searchData: SearchCarpool): Observable<Carpool[]> {
    // Clean up empty fields to avoid serialization issues
    const cleanedData: any = { ...searchData };

    // Remove empty date field
    if (!cleanedData.departureDate || cleanedData.departureDate === '') {
      delete cleanedData.departureDate;
    }

    return this.http.post<Carpool[]>(`${this.apiUrl}/search`, cleanedData);
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

  validateTrip(carpoolId: number, tripOk: boolean, comment?: string): Observable<any> {
    return this.http.post(`${this.participationUrl}/${carpoolId}/validate`, {
      tripOk,
      comment
    });
  }
}
