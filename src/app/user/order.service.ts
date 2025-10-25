import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

// DTOs to match backend
export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderRequestDto {
  shipping: ShippingInfo;
}

export interface OrderResponseDto {
  orderId: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: OrderItemDto[];
  shipping: ShippingInfo;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8056/api/order';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Place a new order
  placeOrder(orderRequest: OrderRequestDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(
      `${this.apiUrl}/place`, 
      orderRequest, 
      { headers: this.getHeaders() }
    );
  }

  // Get specific order by ID
  getOrderById(orderId: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(
      `${this.apiUrl}/${orderId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Get user's order history
  getUserOrderHistory(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(
      `${this.apiUrl}/history`, 
      { headers: this.getHeaders() }
    );
  }

  // Download invoice for an order
  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/invoice/${orderId}`, 
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Get order status with tracking info (mock implementation for UI)
  getOrderTracking(orderId: number): Observable<any> {
    // This would typically come from backend, but creating mock data for UI
    return new Observable(observer => {
      const trackingData = {
        orderId: orderId,
        currentStatus: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        trackingSteps: [
          { status: 'PLACED', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: true, description: 'Order placed successfully' },
          { status: 'CONFIRMED', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: true, description: 'Order confirmed and being prepared' },
          { status: 'SHIPPED', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true, description: 'Order shipped from warehouse' },
          { status: 'IN_TRANSIT', date: new Date(), completed: true, description: 'Order is in transit' },
          { status: 'DELIVERED', date: null, completed: false, description: 'Order delivered' }
        ]
      };
      observer.next(trackingData);
      observer.complete();
    });
  }
}
