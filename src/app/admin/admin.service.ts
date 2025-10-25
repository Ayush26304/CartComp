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

export interface OrderResponseDto {
  orderId: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: OrderItemDto[];
  shipping: ShippingInfoDto;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface ShippingInfoDto {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
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

  // Order Management - Matching your OrderController endpoints exactly
  getAllOrders(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.baseUrl}/order/all`, {
      headers: this.getHeaders()
    });
  }

  getOrderById(id: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.baseUrl}/order/user/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/order/updatestatus/${id}?status=${status}`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/order/delete/${id}`, {
      headers: this.getHeaders()
    });
  }

  trackOrderByInvoice(invoiceNumber: string): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.baseUrl}/order/track/${invoiceNumber}`, {
      headers: this.getHeaders()
    });
  }

  // Additional order management methods matching your controller
  getUserOrderHistory(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.baseUrl}/order/history`, {
      headers: this.getHeaders()
    });
  }

  downloadOrderInvoice(orderId: number): void {
    const url = `${this.baseUrl}/order/invoice/${orderId}`;
    const headers = this.getHeaders();
    
    // Create a link to download with authorization
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': headers.Authorization,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice_${orderId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(error => {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    });
  }

  // Statistics for admin dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`, {
      headers: this.getHeaders()
    });
  }
}
