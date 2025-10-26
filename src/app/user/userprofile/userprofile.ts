import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../userprofile';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderResponseDto } from '../order.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.html',
  styleUrls: ['./userprofile.scss'],
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  standalone: true
})
export class UserProfileComponent implements OnInit {
  @Input() isChildComponent: boolean = false;
  user = {
    name: '',
    email: '',
    image: ''
  };

  profileForm: FormGroup;
  tabs = ['Orders', 'Favorites', 'Addresses'];
  activeTab = 'Orders';
  isEditMode = false;
  showNavbar: boolean = true;

  orders: OrderResponseDto[] = [];
  favorites: any[] = [];
  addresses: any[] = [];
  loadingOrders = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserProfileService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {
    this.profileForm = this.fb.group({
      fullName: [''],
      phone: [''],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    // Show navbar unless explicitly used as child component
    this.showNavbar = !this.isChildComponent;
    
    // Debug: Log JWT claims to see what's available
    if (this.auth.token) {
      const claims = this.auth.getJwtClaims();
      console.log('=== JWT DEBUG INFO ===');
      console.log('Full JWT Claims:', claims);
      console.log('Available userid from auth service:', this.auth.userid);
      console.log('Available username from auth service:', this.auth.username);
      console.log('======================');
      
      // List all available claim keys
      if (claims) {
        console.log('Available claim keys:', Object.keys(claims));
      }
    }

    this.userService.getProfile().subscribe(profile => {
      console.log('Profile response:', profile);
      this.user.name = profile.fullName;
      this.user.email = profile.email;
      // Use random avatar instead of profile photo
      this.user.image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      this.profileForm.patchValue(profile);
      
      // Populate addresses array from profile data
      if (profile.addressLine1 || profile.city || profile.state) {
        this.addresses = [{
          name: profile.fullName || 'Primary Address',
          line1: profile.addressLine1 || '',
          line2: profile.addressLine2 || '',
          city: profile.city || '',
          state: profile.state || '',
          zip: profile.postalCode || '',
          country: profile.country || '',
          phone: profile.phone || '',
          type: 'Home',
          isDefault: true
        }];
      } else {
        this.addresses = [];
      }
      
      // Store user ID from profile if available
      if (profile.id || profile.userId || profile.user_id) {
        const profileUserId = profile.id || profile.userId || profile.user_id;
        console.log('Found user ID in profile:', profileUserId);
        // Store it temporarily for the update call
        (this as any).profileUserId = profileUserId;
      }
    });

    // Load user orders from backend
    this.loadUserOrders();

    // Check for fragment to auto-select tab
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'orders') {
        this.activeTab = 'Orders';
      }
    });
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    
    // Load orders when Orders tab is selected
    if (tab === 'Orders' && this.orders.length === 0) {
      this.loadUserOrders();
    }
  }

  loadUserOrders(): void {
    this.loadingOrders = true;
    this.orderService.getUserOrderHistory().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
        
        // Update favorites with order items
        this.favorites = this.orders.flatMap(order => 
          order.items.map(item => ({
            title: item.productName,
            image: 'https://via.placeholder.com/70',
            price: item.price
          }))
        );
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loadingOrders = false;
      }
    });
  }

  trackOrder(orderId: number): void {
    this.router.navigate(['/order-tracking', orderId]);
  }

  downloadInvoice(orderId: number): void {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${orderId}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice');
      }
    });
  }

  formatOrderDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form to original values when canceling edit
      this.ngOnInit();
    }
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'Orders': return 'orders-icon';
      case 'Favorites': return 'favorites-icon';
      case 'Addresses': return 'addresses-icon';
      default: return '';
    }
  }

  editProfile(): void {
    let userid = this.auth.userid;
    
    // Fallback: try to use user ID from profile response
    if (!userid && (this as any).profileUserId) {
      userid = (this as any).profileUserId.toString();
      console.log('Using fallback user ID from profile:', userid);
    }
    
    // If still no user ID, try using username as ID (some systems do this)
    if (!userid && this.auth.username) {
      console.log('Trying to use username as ID:', this.auth.username);
      // Check if username is numeric
      if (!isNaN(Number(this.auth.username))) {
        userid = this.auth.username;
      }
    }
    
    if (!userid || isNaN(Number(userid))) {
      console.error('Invalid user ID:', userid);
      console.log('Available auth info:', {
        userid: this.auth.userid,
        username: this.auth.username,
        profileUserId: (this as any).profileUserId,
        jwtClaims: this.auth.getJwtClaims()
      });
      alert('Unable to update profile: Invalid user ID. Please check the console for debugging info.');
      return;
    }
    
    const id = parseInt(userid);
    console.log('Using user ID for update:', id);
    
    this.userService.updateProfile(id, this.profileForm.value).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.isEditMode = false;
        
        // Update addresses array with new profile data
        const formData = this.profileForm.value;
        if (formData.addressLine1 || formData.city || formData.state) {
          this.addresses = [{
            name: formData.fullName || 'Primary Address',
            line1: formData.addressLine1 || '',
            line2: formData.addressLine2 || '',
            city: formData.city || '',
            state: formData.state || '',
            zip: formData.postalCode || '',
            country: formData.country || '',
            phone: formData.phone || '',
            type: 'Home',
            isDefault: true
          }];
        } else {
          this.addresses = [];
        }
        
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Profile update failed:', error);
        alert('Failed to update profile. Please try again.');
      }
    });
  }
}
