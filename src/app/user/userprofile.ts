import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable, of, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getProfile(): Observable<any> {
    return this.http.get('http://localhost:8056/api/user/profile', {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    }).pipe(
      catchError((error) => {
        console.error('Profile fetch failed, using fallback data:', error);
        // Return fallback profile data, especially for admin users
        const username = this.auth.username || 'User';
        const fallbackProfile = {
          fullName: username === 'admin' ? 'Administrator' : username,
          email: username === 'admin' ? 'admin@kartcom.com' : `${username}@example.com`,
          username: username,
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        };
        return of(fallbackProfile);
      })
    );
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
