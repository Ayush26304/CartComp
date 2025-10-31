import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface WishlistRequest {
  productId: number;
}

export interface WishlistResponse {
  id: number;
  productId: number;
  addedAt: string;
}

export interface WishlistItem extends WishlistResponse {
  product?: any; // Will be populated with product details
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private baseUrl = 'http://localhost:8056/api/wishlist';
  private wishlistSubject = new BehaviorSubject<WishlistResponse[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load wishlist on service initialization if user is logged in
    if (this.authService.isLoggedIn) {
      this.loadWishlist();
    }

    // Subscribe to authentication state changes
    this.authService.token$.subscribe(token => {
      if (!token) {
        // User logged out, clear wishlist
        this.clearWishlist();
      } else {
        // User logged in, load wishlist
        this.loadWishlist();
      }
    });
  }

  // Add product to wishlist
  addToWishlist(productId: number): Observable<WishlistResponse> {
    const request: WishlistRequest = { productId };

    return this.http.post<WishlistResponse>(`${this.baseUrl}/add`, request, {
      headers: { Authorization: `Bearer ${this.authService.token}` }
    }).pipe(
      tap((response) => {
        // Add the new item to the current wishlist immediately for better UX
        const currentWishlist = this.wishlistSubject.value;
        const newItem: WishlistResponse = {
          id: response.id,
          productId: response.productId,
          addedAt: response.addedAt
        };
        this.wishlistSubject.next([...currentWishlist, newItem]);
      })
    );
  }

  // Get user's wishlist
  getWishlist(): Observable<WishlistResponse[]> {
    return this.http.get<WishlistResponse[]>(`${this.baseUrl}/get`, {
      headers: { Authorization: `Bearer ${this.authService.token}` }
    }).pipe(
      tap(wishlist => {
        this.wishlistSubject.next(wishlist || []);
      })
    );
  }

  // Remove product from wishlist
  removeFromWishlist(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`, {
      headers: { Authorization: `Bearer ${this.authService.token}` }
    }).pipe(
      tap(() => {
        // Remove the item from the current wishlist immediately for better UX
        const currentWishlist = this.wishlistSubject.value;
        const updatedWishlist = currentWishlist.filter(item => item.productId !== productId);
        this.wishlistSubject.next(updatedWishlist);
      })
    );
  }

  // Load wishlist (internal method)
  private loadWishlist(): void {
    if (!this.authService.isLoggedIn) {
      this.wishlistSubject.next([]);
      return;
    }
    
    // Only load if wishlist is empty to prevent redundant calls
    if (this.wishlistSubject.value.length === 0) {
      this.getWishlist().subscribe({
        next: (wishlist) => {
          // The wishlist is already updated in the tap operator
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
          this.wishlistSubject.next([]);
        }
      });
    }
  }

  // Check if product is in wishlist
  isInWishlist(productId: number): boolean {
    const currentWishlist = this.wishlistSubject.value;
    return currentWishlist.some(item => item.productId === productId);
  }

  // Get current wishlist count
  getWishlistCount(): number {
    return this.wishlistSubject.value.length;
  }

  // Get current wishlist items synchronously (from cache)
  getCurrentWishlist(): WishlistResponse[] {
    return this.wishlistSubject.value;
  }

  // Force refresh wishlist from server
  refreshWishlist(): Observable<WishlistResponse[]> {
    if (!this.authService.isLoggedIn) {
      this.wishlistSubject.next([]);
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    return this.getWishlist();
  }

  // Toggle wishlist status for a product
  toggleWishlist(productId: number): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  // Clear wishlist (for logout)
  clearWishlist(): void {
    this.wishlistSubject.next([]);
  }
}
