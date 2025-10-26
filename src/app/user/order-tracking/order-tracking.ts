import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { OrderService, OrderResponseDto } from '../order.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.html',
  styleUrls: ['./order-tracking.scss'],
  imports: [CommonModule, NavbarComponent, FooterComponent],
  standalone: true
})
export class OrderTrackingComponent implements OnInit {
  orderId: number | null = null;
  invoiceNumber: string | null = null;
  orderDetails: OrderResponseDto | null = null;
  trackingInfo: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Check if it's a number (order ID) or string (invoice number)
      if (/^\d+$/.test(id)) {
        // It's a numeric order ID
        this.orderId = +id;
        this.loadOrderDetailsById();
      } else {
        // It's an invoice number
        this.invoiceNumber = id;
        this.loadOrderDetailsByInvoice();
      }
    }
  }

  loadOrderDetailsById(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.loadTrackingInfo(); // Generate tracking info after order details are loaded
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  loadOrderDetailsByInvoice(): void {
    if (!this.invoiceNumber) return;
    
    this.loading = true;
    this.orderService.trackOrderByInvoice(this.invoiceNumber).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.orderId = order.orderId; // Set orderId for other methods
        this.loadTrackingInfo(); // Generate tracking info after order details are loaded
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order by invoice:', error);
        this.error = 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  loadTrackingInfo(): void {
    // Generate tracking info based on actual order status
    if (this.orderDetails) {
      this.trackingInfo = this.generateTrackingProgress(this.orderDetails.status);
    }
  }

  // Generate progress tracking based on current order status
  generateTrackingProgress(currentStatus: string): any {
    // Define the order status progression
    const statusProgression = [
      { status: 'PENDING', label: 'Order Placed', description: 'Your order has been placed successfully' },
      { status: 'CONFIRMED', label: 'Order Confirmed', description: 'Order confirmed and being prepared' },
      { status: 'PROCESSING', label: 'Processing', description: 'Your order is being processed' },
      { status: 'SHIPPED', label: 'Shipped', description: 'Order has been shipped from our warehouse' },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Order is out for delivery' },
      { status: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered successfully' }
    ];

    // Handle cancelled/returned orders
    if (currentStatus === 'CANCELLED') {
      return {
        currentStatus: 'CANCELLED',
        trackingSteps: [
          { status: 'PENDING', label: 'Order Placed', description: 'Your order was placed', completed: true, current: false },
          { status: 'CANCELLED', label: 'Order Cancelled', description: 'Your order has been cancelled', completed: true, current: true }
        ],
        estimatedDelivery: null
      };
    }

    if (currentStatus === 'RETURNED') {
      return {
        currentStatus: 'RETURNED',
        trackingSteps: [
          { status: 'PENDING', label: 'Order Placed', description: 'Your order was placed', completed: true, current: false },
          { status: 'DELIVERED', label: 'Delivered', description: 'Order was delivered', completed: true, current: false },
          { status: 'RETURNED', label: 'Returned', description: 'Order has been returned', completed: true, current: true }
        ],
        estimatedDelivery: null
      };
    }

    // Find current status index
    const currentIndex = statusProgression.findIndex(step => step.status === currentStatus);
    
    // Generate tracking steps
    const trackingSteps = statusProgression.map((step, index) => ({
      status: step.status,
      label: step.label,
      description: step.description,
      completed: index <= currentIndex,
      current: index === currentIndex,
      date: index <= currentIndex ? this.orderDetails?.orderDate : null
    }));

    // Calculate estimated delivery (2-3 days from order date for non-delivered orders)
    let estimatedDelivery = null;
    if (currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED' && currentStatus !== 'RETURNED') {
      const orderDate = new Date(this.orderDetails?.orderDate || Date.now());
      estimatedDelivery = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from order
    }

    return {
      currentStatus,
      trackingSteps,
      estimatedDelivery
    };
  }

  downloadInvoice(): void {
    if (!this.orderId) return;
    
    this.orderService.downloadInvoice(this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${this.orderId}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice');
      }
    });
  }

  cancelOrder(): void {
    if (!this.orderId || !this.orderDetails) return;
    
    // Show confirmation dialog
    const confirmCancel = confirm('Are you sure you want to cancel this order? This action cannot be undone.');
    if (!confirmCancel) return;
    
    this.loading = true;
    this.orderService.cancelOrder(this.orderId).subscribe({
      next: (updatedOrder) => {
        this.orderDetails = updatedOrder;
        this.loadTrackingInfo(); // Refresh tracking info to show cancelled status
        this.loading = false;
        alert('Order has been cancelled successfully.');
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.loading = false;
        alert('Failed to cancel order. Please try again or contact support.');
      }
    });
  }

  canCancelOrder(): boolean {
    if (!this.orderDetails) return false;
    
    // Allow cancellation only for orders that are not yet shipped or delivered
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    return cancellableStatuses.includes(this.orderDetails.status);
  }

  goBack(): void {
    this.router.navigate(['/userprofile'], { fragment: 'orders' });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
