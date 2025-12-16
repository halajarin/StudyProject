import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Covoiturage, SearchCovoiturage, CreateCovoiturage } from '../models/covoiturage.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CovoiturageService {
  private apiUrl = `${environment.apiUrl}/covoiturage`;

  constructor(private http: HttpClient) {}

  search(searchData: SearchCovoiturage): Observable<Covoiturage[]> {
    return this.http.post<Covoiturage[]>(`${this.apiUrl}/search`, searchData);
  }

  getById(id: number): Observable<Covoiturage> {
    return this.http.get<Covoiturage>(`${this.apiUrl}/${id}`);
  }

  create(covoiturage: CreateCovoiturage): Observable<any> {
    return this.http.post(this.apiUrl, covoiturage);
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
