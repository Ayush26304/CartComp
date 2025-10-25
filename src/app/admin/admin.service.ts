import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

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
}

export interface OrderSummaryDto {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  customerName: string;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8056/api';
  
  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return { Authorization: `Bearer ${this.auth.token}` };
  }

  // User Management
  getAllUsers(): Observable<UserProfileDto[]> {
    return this.http.get<UserProfileDto[]>(`${this.baseUrl}/user/all`, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/user/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${id}`, {
      headers: this.getHeaders()
    });
  }

  createMinimalProfile(profile: MinimalProfileDto): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/user/create-minimal`, profile, {
      headers: this.getHeaders()
    });
  }

  // Category Management (already exists in CategoriesService but adding here for admin context)
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/catalog/category`, {
      headers: this.getHeaders()
    });
  }

  addCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/catalog/category`, category, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/catalog/category/${id}`, category, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalog/category/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Product Management
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/catalog/product`, {
      headers: this.getHeaders()
    });
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/catalog/product`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/catalog/product/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalog/product/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Order Management - Note: You may need to add `/all` endpoint to OrderController for admin access
  getAllOrders(): Observable<OrderSummaryDto[]> {
    // For now, this will return empty array until backend adds admin order endpoint
    // You can add this endpoint to OrderController: @GetMapping("/all") @PreAuthorize("hasRole('ADMIN')")
    return this.http.get<OrderSummaryDto[]>(`${this.baseUrl}/order/all`, {
      headers: this.getHeaders()
    });
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/order/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/order/${id}/status`, { status }, {
      headers: this.getHeaders()
    });
  }
}
