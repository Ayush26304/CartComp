import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface UserProfileDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8056/api/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllUsers(): Observable<UserProfileDto[]> {
    return this.http.get<UserProfileDto[]>(`${this.apiUrl}/all`, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createUser(user: any): Observable<UserProfileDto> {
    return this.http.post<UserProfileDto>(`${this.apiUrl}/create`, user, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: number, user: any): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.apiUrl}/${id}`, user, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  updateUserProfile(profile: any): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.apiUrl}/profile`, profile, {
      headers: this.getHeaders()
    });
  }
}
