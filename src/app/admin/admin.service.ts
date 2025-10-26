import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

// DTOs matching backend structure
export interface OrderResponseDto {
  orderId: number;
  userId: number;
  invoiceNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItemDto[];
  shipping: ShippingInfo;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8056/api';

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

  // Order Management - matching backend OrderController endpoints
  getAllOrders(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/order/all`, {
      headers: this.getHeaders()
    });
  }

  getOrderById(orderId: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.apiUrl}/order/user/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/order/updatestatus/${orderId}?status=${status}`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/order/delete/${orderId}`, {
      headers: this.getHeaders()
    });
  }

  downloadOrderInvoice(orderId: number): void {
    const url = `${this.apiUrl}/order/invoice/${orderId}`;
    const headers = this.getHeaders();
    
    this.http.get(url, {
      headers: headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `invoice-${orderId}.txt`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice');
      }
    });
  }

  // Category Management
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog/category`, {
      headers: this.getHeaders()
    });
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/catalog/category`, category, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/catalog/category/${id}`, category, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalog/category/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Product Management
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalog/product`, {
      headers: this.getHeaders()
    });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/catalog/product`, product, {
      headers: this.getHeaders()
    });
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/catalog/product/${id}`, product, {
      headers: this.getHeaders()
    });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/catalog/product/${id}`, {
      headers: this.getHeaders()
    });
  }
}
