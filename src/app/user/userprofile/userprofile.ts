import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../userprofile';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderResponseDto } from '../order.service';
import { WishlistService } from '../wishlist.service';
import { CategoriesService, ProductDto } from '../pages/categoriesservice';
import { CartService } from '../cartservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.html',
  styleUrls: ['./userprofile.scss'],
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  standalone: true
})
export class UserProfileComponent implements OnInit, OnDestroy {
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
  favorites: ProductDto[] = [];
  addresses: any[] = [];
  loadingOrders = false;
  loadingFavorites = false;
  private wishlistSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private userService: UserProfileService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private wishlistService: WishlistService,
    private categoriesService: CategoriesService,
    private cartService: CartService
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
    
    // Set initial fallback values
    const username = this.auth.username || 'User';
    this.user.name = username === 'admin' ? 'Administrator' : username;
    this.user.email = username === 'admin' ? 'admin@kartcom.com' : `${username}@example.com`;
    this.user.image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    
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

    this.userService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile response:', profile);
        this.user.name = profile.fullName || profile.username || this.auth.username || 'User';
        this.user.email = profile.email || 'No email provided';
        // Use random avatar instead of profile photo
        this.user.image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || this.auth.username || 'default'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
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
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Set fallback values for admin or when profile fails
        this.user.name = this.auth.username || 'Admin User';
        this.user.email = 'admin@example.com'; // Fallback email for admin
        this.user.image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.auth.username || 'admin'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
        
        // Set some default form values for admin
        this.profileForm.patchValue({
          fullName: this.auth.username || 'Admin User',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        });
      }
    });    
    
    // Load user orders from backend
    this.loadUserOrders();

    // Load wishlist/favorites
    this.loadFavorites();

    // Subscribe to wishlist changes for smooth updates
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe((wishlistItems) => {
      // Update favorites immediately without loading state
      this.updateFavoritesFromWishlist(wishlistItems);
    });

    // Check for fragment to auto-select tab
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'orders') {
        this.activeTab = 'Orders';
      } else if (fragment === 'favorites') {
        this.activeTab = 'Favorites';
      } else if (fragment === 'addresses') {
        this.activeTab = 'Addresses';
      }
    });
  }

  ngOnDestroy(): void {
    this.wishlistSubscription.unsubscribe();
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
    
    // Load orders when Orders tab is selected
    if (tab === 'Orders' && this.orders.length === 0) {
      this.loadUserOrders();
    }
    
    // Load favorites when Favorites tab is selected
    if (tab === 'Favorites') {
      this.loadFavorites();
    }
  }

  loadFavorites(): void {
    this.loadingFavorites = true;
    
    // Check if wishlistService is available
    if (!this.wishlistService) {
      console.error('WishlistService is not available');
      this.loadingFavorites = false;
      this.favorites = [];
      return;
    }
    
    // Use the current wishlist from the service's cache
    const wishlistItems = this.wishlistService.getCurrentWishlist();
    
    // Handle null or empty wishlist
    if (!wishlistItems || wishlistItems.length === 0) {
      this.favorites = [];
      this.loadingFavorites = false;
      return;
    }

    // Get product details for each wishlist item
    const productRequests = wishlistItems.map(item => 
      this.categoriesService.getProductById(item.productId)
    );

    // Wait for all product details
    Promise.all(productRequests.map(req => req.toPromise())).then(products => {
      this.favorites = products.filter(p => p != null) as ProductDto[];
      this.favorites.forEach(product => product.isFavorite = true);
      this.loadingFavorites = false;
    }).catch(error => {
      console.error('Error loading favorite product details:', error);
      this.favorites = [];
      this.loadingFavorites = false;
    });
  }

  // Update favorites from wishlist changes without loading state
  private updateFavoritesFromWishlist(wishlistItems: any[]): void {
    if (!wishlistItems || wishlistItems.length === 0) {
      this.favorites = [];
      return;
    }

    // Get current favorite product IDs
    const currentFavoriteIds = this.favorites.map(f => f.id);
    const wishlistProductIds = wishlistItems.map(w => w.productId);

    // Check if we need to update (avoid unnecessary updates)
    const hasChanges = currentFavoriteIds.length !== wishlistProductIds.length ||
                      !currentFavoriteIds.every(id => wishlistProductIds.includes(id));

    if (!hasChanges) {
      return; // No changes needed
    }

    // If there are new items in wishlist that aren't in favorites, load them
    const newProductIds = wishlistProductIds.filter(id => !currentFavoriteIds.includes(id));
    const removedProductIds = currentFavoriteIds.filter(id => !wishlistProductIds.includes(id));

    // Remove items that are no longer in wishlist
    if (removedProductIds.length > 0) {
      this.favorites = this.favorites.filter(f => !removedProductIds.includes(f.id));
    }

    // Add new items to favorites
    if (newProductIds.length > 0) {
      const productRequests = newProductIds.map(id => 
        this.categoriesService.getProductById(id)
      );

      Promise.all(productRequests.map(req => req.toPromise())).then(products => {
        const newProducts = products.filter(p => p != null) as ProductDto[];
        newProducts.forEach(product => product.isFavorite = true);
        this.favorites = [...this.favorites, ...newProducts];
      }).catch(error => {
        console.error('Error loading new favorite products:', error);
      });
    }
  }

  removeFromWishlist(product: ProductDto): void {
    if (!this.wishlistService) {
      alert('Wishlist service is not available. Please refresh the page.');
      return;
    }

    // Immediately remove from UI for better UX
    this.favorites = this.favorites.filter(p => p.id !== product.id);
    
    this.wishlistService.removeFromWishlist(product.id).subscribe({
      next: () => {
        alert(`${product.name} removed from wishlist successfully!`);
        // No need to reload - the wishlist subscription will handle updates
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        alert('Failed to remove from wishlist. Please try again.');
        // Reload favorites to restore the item if removal failed
        this.loadFavorites();
      }
    });
  }

  addToCartFromWishlist(product: ProductDto): void {
    const cartItem = {
      id: product.id,
      image: product.imageUrl,
      title: product.name,
      price: product.price
    };
    
    this.cartService.addToCart(cartItem, 1).subscribe({
      next: (response) => {
        alert(`${product.name} added to cart successfully!`);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert(`Failed to add ${product.name} to cart. Please try again.`);
      }
    });
  }

  loadUserOrders(): void {
    this.loadingOrders = true;
    this.orderService.getUserOrderHistory().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
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
        // Create a fallback invoice with user information
        this.createFallbackInvoice(orderId);
      }
    });
  }

  private createFallbackInvoice(orderId: number): void {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) {
      alert('Order not found');
      return;
    }

    const userName = this.user.name || this.auth.username || 'User';
    const userEmail = this.user.email || 'No email provided';
    
    let invoiceContent = `
INVOICE
=========================================

Order ID: ${order.orderId}
Invoice Number: ${order.invoiceNumber}
Order Date: ${this.formatOrderDate(order.orderDate)}

Customer Information:
Name: ${userName}
Email: ${userEmail}

Shipping Address:
${order.shipping.fullName}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
${order.shipping.country}
Phone: ${order.shipping.phone}

Items Ordered:
=========================================
`;

    order.items.forEach(item => {
      invoiceContent += `${item.productName} - Qty: ${item.quantity} - ₹${item.price} each\n`;
      invoiceContent += `Subtotal: ₹${item.price * item.quantity}\n\n`;
    });

    invoiceContent += `=========================================
Total Amount: ₹${order.totalAmount}
Status: ${order.status.replace('_', ' ')}

Thank you for your order!
KartCom - Your Shopping Partner
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${orderId}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
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
