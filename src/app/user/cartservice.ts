import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
export interface CartItem {
  id: number;
  image:string;
  title: string;
  price: number;
  quantity: number;
}
 
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
 
  cart$ = this.cartSubject.asObservable();
 
  // Add product and quantity from ProductDescriptionComponent
  addToCart(product: { id: number;image:string, title: string; price: number }, quantity: number) {
    console.log(product.title);
    const existing = this.cartItems.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      console.log(product);
      console.log(quantity);
      this.cartItems.push({ ...product, quantity });
      console.log(this.cartItems);
    }
    this.cartSubject.next(this.cartItems);
  }

  getCartItems(){
    return this.cartItems;
  }
 
  removeItem(id: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.cartSubject.next(this.cartItems);
  }
 
  clearCart() {
    this.cartItems = [];
    this.cartSubject.next(this.cartItems);
  }
 
  getTotalQuantity(): number {
    return this.cartItems.length;
  }
 
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}