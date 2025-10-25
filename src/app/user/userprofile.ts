import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getProfile(): Observable<any> {
    return this.http.get('http://localhost:8056/api/user/profile', {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  updateProfile(id: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:8056/api/user/${id}`, data, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8056/api/order/history', {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }
}
