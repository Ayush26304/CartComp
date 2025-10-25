import { Component, OnInit, Input } from '@angular/core';
import { CartService } from '../cartservice';
import { CartItem } from '../cartservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  imports:[FormsModule,CommonModule,NavbarComponent]
})
export class CartComponent implements OnInit {
  @Input() isChildComponent: boolean = false;
  cartItems: CartItem[] = [];
  totalQuantity = 0;
  totalPrice = 0;
  showNavbar: boolean = true;
  
 
  constructor(private cartService: CartService, private router: Router, private route: ActivatedRoute) {}
 
  ngOnInit(): void {
    // Check if this component is being used as a child
    this.showNavbar = !this.isChildComponent && !this.route.parent;
    
    // Load cart from backend and subscribe to changes
    this.cartService.loadCartFromBackend();
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log('Cart items updated:', this.cartItems);
      this.calculateTotals();
    });
  }
   navigatetoshop(){
   this.router.navigate(['/categories']);
   }
  calculateTotals() {
    this.totalQuantity = this.cartService.getTotalQuantity();
    this.totalPrice = this.cartService.getTotalPrice();
  }
 
  removeItem(id: number) {
    this.cartService.removeItem(id).subscribe({
      next: (response) => {
        console.log('Item removed:', response);
      },
      error: (error) => {
        console.error('Error removing item:', error);
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