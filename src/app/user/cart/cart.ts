import { Component, OnInit } from '@angular/core';
import { CartService } from '../cartservice';
import { CartItem } from '../cartservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
 import { Router } from '@angular/router';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  imports:[FormsModule,CommonModule]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalQuantity = 0;
  totalPrice = 0;
  
 
  constructor(private cartService: CartService ,private router:Router) {}
 
  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log(this.cartItems);
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
    this.cartService.removeItem(id);
  }
 
  clearCart() {
    this.cartService.clearCart();
  }
  navigatetocheckout(){
    this.router.navigate(['/checkout']);
  }
}