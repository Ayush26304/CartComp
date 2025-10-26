import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { CartService } from '../cartservice';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { OrderService, OrderRequestDto, OrderResponseDto, ShippingInfo } from '../order.service';
import { Subscription } from 'rxjs';
 
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports:[FormsModule, CommonModule, NavbarComponent, FooterComponent],
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @Input() isChildComponent: boolean = false;
  @ViewChild('addressForm') addressForm!: NgForm;
  
  cartItems: any[] = [];
  totalPrice: number = 0;
  showSuccess = false;
  showNavbar: boolean = true;
  placedOrder: OrderResponseDto | null = null;
  private cartSubscription?: Subscription;
  isProcessing = false;
 
  constructor(
    private cartService: CartService, 
    private router: Router, 
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}
 
  ngOnInit() {
    // Show navbar unless explicitly used as child component
    this.showNavbar = !this.isChildComponent;
    
    // Subscribe to cart changes first
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });

    // Only load from backend if cart is empty (avoid unnecessary calls)
    if (this.cartService.getCartItems().length === 0) {
      console.log('Cart is empty in checkout, loading from backend...');
      this.cartService.loadCartFromBackend();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
 
  placeOrder() {
    if (!this.addressForm.valid) {
      alert('Please fill in all required address fields');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    this.isProcessing = true;

    // Prepare shipping info from form
    const formValue = this.addressForm.value;
    const shippingInfo: ShippingInfo = {
      fullName: formValue.name,
      address: formValue.address,
      city: formValue.city,
      state: formValue.city, // Using city as state for simplicity
      zipCode: formValue.pincode,
      country: 'India',
      phone: formValue.phone
    };

    const orderRequest: OrderRequestDto = {
      shipping: shippingInfo
    };

    // Place order via service
    this.orderService.placeOrder(orderRequest).subscribe({
      next: (response: OrderResponseDto) => {
        this.placedOrder = response;
        this.showSuccess = true;
        this.isProcessing = false;
        
        // Clear cart after successful order
        this.cartService.clearCart().subscribe({
          next: () => {
            console.log('Cart cleared after successful order');
          },
          error: (error) => {
            console.error('Error clearing cart:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.isProcessing = false;
        alert('Failed to place order. Please try again.');
      }
    });
  }
 
  closePopup() {
    this.showSuccess = false;
    if (this.placedOrder) {
      // Navigate to order tracking page
      this.router.navigate(['/userprofile'], { fragment: 'orders' });
    } else {
      this.router.navigate(['/home']);
    }
  }

  // Navigate to order tracking
  viewOrderTracking() {
    if (this.placedOrder) {
      this.router.navigate(['/order-tracking', this.placedOrder.orderId]);
    }
  }
}