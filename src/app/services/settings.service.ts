import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = 'http://localhost:3000/api/client/update-profile'; // Change this accordingly

  constructor(private http: HttpClient) {}

  updateProfile(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
