import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CartService } from '../cartservice';
import { CartItem } from '../cartservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  imports:[FormsModule, CommonModule, NavbarComponent, FooterComponent]
})
export class CartComponent implements OnInit, OnDestroy {
  @Input() isChildComponent: boolean = false;
  cartItems: CartItem[] = [];
  totalQuantity = 0;
  totalPrice = 0;
  showNavbar: boolean = true;
  private cartSubscription?: Subscription;
  private removingItems = new Set<number>(); // Track items being removed
  
 
  constructor(private cartService: CartService, private router: Router, private route: ActivatedRoute) {}
 
  ngOnInit(): void {
    // Show navbar unless explicitly used as child component
    this.showNavbar = !this.isChildComponent;
    
    // Subscribe to cart changes with proper subscription management
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log('Cart items updated:', this.cartItems);
      this.calculateTotals();
    });

    // Only load from backend if cart is empty (avoid unnecessary calls)
    if (this.cartService.getCartItems().length === 0) {
      console.log('Cart is empty, loading from backend...');
      this.cartService.loadCartFromBackend();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
   navigatetoshop(){
   this.router.navigate(['/categories']);
   }
  calculateTotals() {
    this.totalQuantity = this.cartService.getTotalQuantity();
    this.totalPrice = this.cartService.getTotalPrice();
  }

  isRemoving(itemId: number): boolean {
    return this.removingItems.has(itemId);
  }
 
  removeItem(id: number) {
    // Prevent double-clicking
    if (this.removingItems.has(id)) {
      console.log('Item already being removed, ignoring...');
      return;
    }
    
    this.removingItems.add(id);
    
    this.cartService.removeItem(id).subscribe({
      next: (response) => {
        console.log('Item removed:', response);
        this.removingItems.delete(id);
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.removingItems.delete(id);
      }
    });
  }
 
  clearCart() {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('Cart cleared:', response);
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  // Method to update quantity (you can add UI controls for this)
  updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    this.cartService.updateCartItem(productId, newQuantity).subscribe({
      next: (response) => {
        console.log('Quantity updated:', response);
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }
  navigatetocheckout(){
    this.router.navigate(['/checkout']);
  }
}