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
  private isLoading = false; // Prevent multiple simultaneous loads
  private loadTimeout: any = null; // Debounce cart loading

  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Load cart items when service is initialized (only if user is logged in)
    if (this.authService.isLoggedIn) {
      this.loadCartFromBackend();
    }
  }

  // Debug method to test cart API
  testCartAPI(): void {
    console.log('Testing cart API...');
    console.log('Token:', this.authService.token);
    console.log('Is logged in:', this.authService.isLoggedIn);
    console.log('API URL:', this.apiUrl);
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

  // Load cart items from backend with debouncing
  loadCartFromBackend(): void {
    // Clear any existing timeout
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }

    // Debounce cart loading to prevent multiple rapid calls
    this.loadTimeout = setTimeout(() => {
      this.performCartLoad();
    }, 100); // 100ms debounce
  }

  private performCartLoad(): void {
    // Prevent multiple simultaneous loads
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.http.get<CartItemResponseDto[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          const newCartItems = response.map(dto => this.convertToCartItem(dto));
          
          // Only update if the cart has actually changed
          if (JSON.stringify(this.cartItems) !== JSON.stringify(newCartItems)) {
            this.cartItems = newCartItems;
            this.cartSubject.next([...this.cartItems]); // Create new array reference
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.isLoading = false;
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
      this.http.post(`${this.apiUrl}/add`, requestDto, { 
        headers: this.getHeaders(),
        responseType: 'text' as 'json' // Handle text response from backend
      })
        .subscribe({
          next: (response: any) => {
            // Reload cart from backend to get updated state (debounced)
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            // If it's a successful response but handled as error (common with text responses)
            if (error.status === 200 || error.status === 201) {
              this.loadCartFromBackend();
              observer.next('Item added to cart successfully');
              observer.complete();
            } else {
              // Fallback to local cart for UI consistency
              this.addToLocalCart(product, quantity);
              observer.error(error);
            }
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
    this.cartSubject.next([...this.cartItems]); // Create new array reference
  }

  // Update cart item quantity
  updateCartItem(productId: number, newQuantity: number): Observable<string> {
    const requestDto: CartItemRequestDto = {
      productId: productId,
      quantity: newQuantity
    };

    return new Observable(observer => {
      this.http.put(`${this.apiUrl}/update`, requestDto, { 
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      })
        .subscribe({
          next: (response: any) => {
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error updating cart:', error);
            
            // Handle successful status codes that might be treated as errors
            if (error.status === 200 || error.status === 201) {
              this.loadCartFromBackend();
              observer.next('Cart updated successfully');
              observer.complete();
            } else {
              // Fallback to local update
              this.updateLocalCart(productId, newQuantity);
              observer.error(error);
            }
          }
        });
    });
  }

  // Fallback local update method
  private updateLocalCart(productId: number, newQuantity: number): void {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      this.cartSubject.next([...this.cartItems]); // Create new array reference
    }
  }

  // Remove item from cart
  removeItem(productId: number): Observable<string> {
    // Immediately remove from local state for better UX
    const originalItems = [...this.cartItems];
    this.removeLocalItem(productId);
    
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/remove/${productId}`, { 
        headers: this.getHeaders(),
        responseType: 'text' as 'json'
      })
        .subscribe({
          next: (response: any) => {
            // Reload to sync with backend state
            this.loadCartFromBackend();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {            
            // Handle successful status codes that might be treated as errors
            if (error.status === 200 || error.status === 201) {
              this.loadCartFromBackend();
              observer.next('Item removed successfully');
              observer.complete();
            } else {
              // Restore original state on actual failure
              this.cartItems = originalItems;
              this.cartSubject.next([...this.cartItems]);
              observer.error(error);
            }
          }
        });
    });
  }

  // Fallback local remove method
  private removeLocalItem(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.cartSubject.next([...this.cartItems]); // Create new array reference
  }

  // Clear entire cart
  clearCart(): Observable<string> {
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/clear`, { 
        headers: this.getHeaders(),
        responseType: 'text' as 'json' // Handle text response from backend
      })
        .subscribe({
          next: (response: any) => {
            this.cartItems = [];
            this.cartSubject.next([...this.cartItems]);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            // Handle successful status codes that might be treated as errors
            if (error.status === 200 || error.status === 201) {
              this.cartItems = [];
              this.cartSubject.next([...this.cartItems]);
              observer.next('Cart cleared successfully');
              observer.complete();
            } else {
              // Fallback to local clear
              this.clearLocalCart();
              observer.error(error);
            }
          }
        });
    });
  }

  // Fallback local clear method
  private clearLocalCart(): void {
    this.cartItems = [];
    this.cartSubject.next([...this.cartItems]); // Create new array reference
  }

  // Force immediate cart refresh (bypasses debouncing)
  forceRefreshCart(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
    this.performCartLoad();
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