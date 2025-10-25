import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { OrderService, OrderResponseDto } from '../order.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.html',
  styleUrls: ['./order-tracking.scss'],
  imports: [CommonModule, NavbarComponent],
  standalone: true
})
export class OrderTrackingComponent implements OnInit {
  orderId: number | null = null;
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
      this.orderId = +id;
      this.loadOrderDetails();
      this.loadTrackingInfo();
    }
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.orderDetails = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  loadTrackingInfo(): void {
    if (!this.orderId) return;
    
    this.orderService.getOrderTracking(this.orderId).subscribe({
      next: (tracking) => {
        this.trackingInfo = tracking;
      },
      error: (error) => {
        console.error('Error loading tracking:', error);
      }
    });
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
