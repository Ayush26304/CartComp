import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

// DTOs to match backend
export interface CartItemRequestDto {
  productId: number;
  quantity: number;
}

export interface CartItemResponseDto {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  availableStock: number;
}

// Keep the old interface for UI compatibility
export interface CartItem {
  id: number;
  image: string;
  title: string;
  price: number;
  quantity: number;
  availableStock?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly apiUrl = 'http://localhost:8056/api/cart';

  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load cart items when service is initialized
    this.loadCartFromBackend();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Convert backend DTO to frontend interface
  private convertToCartItem(dto: CartItemResponseDto): CartItem {
    return {
      id: dto.productId,
      image: dto.imageUrl,
      title: dto.name,
      price: dto.price,
      quantity: dto.quantity,
      availableStock: dto.availableStock
    };
  }

  // Load cart items from backend
  loadCartFromBackend(): void {
    this.http.get<CartItemResponseDto[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.cartItems = response.map(dto => this.convertToCartItem(dto));
          this.cartSubject.next(this.cartItems);
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          // Keep local cart items if backend fails
        }
      });
  }

  // Add product to cart (compatible with existing UI)
  addToCart(product: { id: number; image: string; title: string; price: number }, quantity: number): Observable<string> {
    const requestDto: CartItemRequestDto = {
      productId: product.id,
      quantity: quantity
    };

    return new Observable(observer => {
      this.http.post<string>(`${this.apiUrl}/add`, requestDto, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            // Reload cart from backend to get updated state
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error adding to cart:', error);
            // Fallback to local cart for UI consistency
            this.addToLocalCart(product, quantity);
            observer.error(error);
          }
        });
    });
  }

  // Fallback local cart method
  private addToLocalCart(product: { id: number; image: string; title: string; price: number }, quantity: number): void {
    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({
        id: product.id,
        image: product.image,
        title: product.title,
        price: product.price,
        quantity: quantity
      });
    }
    this.cartSubject.next(this.cartItems);
  }

  // Update cart item quantity
  updateCartItem(productId: number, newQuantity: number): Observable<string> {
    const requestDto: CartItemRequestDto = {
      productId: productId,
      quantity: newQuantity
    };

    return new Observable(observer => {
      this.http.put<string>(`${this.apiUrl}/update`, requestDto, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error updating cart:', error);
            // Fallback to local update
            this.updateLocalCart(productId, newQuantity);
            observer.error(error);
          }
        });
    });
  }

  // Fallback local update method
  private updateLocalCart(productId: number, newQuantity: number): void {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      this.cartSubject.next(this.cartItems);
    }
  }

  // Remove item from cart
  removeItem(productId: number): Observable<string> {
    return new Observable(observer => {
      this.http.delete<string>(`${this.apiUrl}/remove/${productId}`, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error removing item:', error);
            // Fallback to local removal
            this.removeLocalItem(productId);
            observer.error(error);
          }
        });
    });
  }

  // Fallback local remove method
  private removeLocalItem(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.cartSubject.next(this.cartItems);
  }

  // Clear entire cart
  clearCart(): Observable<string> {
    return new Observable(observer => {
      this.http.delete<string>(`${this.apiUrl}/clear`, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            this.cartItems = [];
            this.cartSubject.next(this.cartItems);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error clearing cart:', error);
            // Fallback to local clear
            this.clearLocalCart();
            observer.error(error);
          }
        });
    });
  }

  // Fallback local clear method
  private clearLocalCart(): void {
    this.cartItems = [];
    this.cartSubject.next(this.cartItems);
  }

  // Keep existing methods for UI compatibility
  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}