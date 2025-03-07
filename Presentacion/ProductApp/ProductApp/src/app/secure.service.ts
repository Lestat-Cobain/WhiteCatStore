import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecureService {
  private apiUrl = `${environment.apiUrl}`; // Your API base URL

  constructor(private http: HttpClient) {}

  getSecureData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/secure`    );
  }
}
