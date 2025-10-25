import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
}

export interface MinimalProfileDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8056/api/user';
  
  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return { Authorization: `Bearer ${this.auth.token}` };
  }

  // Test endpoint
  testConnection(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/hi`, {
      headers: this.getHeaders()
    });
  }

  // Get all users (Admin only)
  getAllUsers(): Observable<UserProfileDto[]> {
    return this.http.get<UserProfileDto[]>(`${this.baseUrl}/all`, {
      headers: this.getHeaders()
    });
  }

  // Get user by ID (Admin only)
  getUserById(id: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get current user profile (User)
  getCurrentUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  // Update user (User/Admin)
  updateUser(id: number, updateData: UpdateProfileDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, updateData, {
      headers: this.getHeaders()
    });
  }

  // Create minimal profile
  createMinimalProfile(profile: MinimalProfileDto): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/create-minimal`, profile, {
      headers: this.getHeaders()
    });
  }

  // Delete user (Admin only)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
