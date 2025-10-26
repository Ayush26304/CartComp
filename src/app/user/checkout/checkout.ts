import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CartService } from '../cartservice';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { OrderService, OrderRequestDto, OrderResponseDto, ShippingInfo } from '../order.service';
 
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports:[FormsModule,CommonModule,NavbarComponent],
  styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit {
  @Input() isChildComponent: boolean = false;
  @ViewChild('addressForm') addressForm!: NgForm;
  
  cartItems: any[] = [];
  totalPrice: number = 0;
  showSuccess = false;
  showNavbar: boolean = true;
  placedOrder: OrderResponseDto | null = null;
  isProcessing = false;
 
  constructor(
    private cartService: CartService, 
    private router: Router, 
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}
 
  ngOnInit() {
    // Check if this component is being used as a child
    this.showNavbar = !this.isChildComponent && !this.route.parent;
    
    // Load cart from backend and subscribe to changes
    this.cartService.loadCartFromBackend();
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
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