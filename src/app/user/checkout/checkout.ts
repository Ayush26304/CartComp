import { Component, OnInit } from '@angular/core';
import { CartService } from '../cartservice';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports:[FormsModule,CommonModule],
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  showSuccess = false;
 
  constructor(private cartService: CartService, private router: Router) {}
 
  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    this.totalPrice = this.cartService.getTotalPrice();
  }
 
  placeOrder() {
    this.showSuccess = true;
    this.cartService.clearCart();
 
    // Auto-close after 3 seconds and navigate
    setTimeout(() => {
      this.closePopup();
    }, 3000);
  }
 
  closePopup() {
    this.showSuccess = false;
    this.router.navigate(['/home']);
  }
}