import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../admin.service';
import { UserService, UserProfileDto } from '../../../services/user.service';
import { AuthService } from '../../../../auth/auth.service';
import { CategoryModalComponent } from '../../../components/category-modal/category-modal';
import { ProductModalComponent } from '../../../components/product-modal/product-modal';
import { UserModalComponent } from '../../../components/user-modal/user-modal';
 
@Component({
  selector: 'app-admin',
  templateUrl: 'admin-dashboard.html',
  styleUrl: 'admin-dashboard.scss',
  imports: [CommonModule, RouterModule, CategoryModalComponent, ProductModalComponent, UserModalComponent],
  standalone: true
})
export class AdminComponent implements OnInit {
  activeSection = 'overview';
  
  // Overview stats
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  };

  // Data for each section
  users: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  orders: any[] = [];

  // Loading states
  loading = {
    users: false,
    categories: false,
    products: false,
    orders: false
  };

  // Modal states
  modals = {
    user: {
      visible: false,
      isEdit: false,
      data: null
    },
    category: {
      visible: false,
      isEdit: false,
      data: null
    },
    product: {
      visible: false,
      isEdit: false,
      data: null
    }
  };

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOverviewStats();
  }

  setActiveSection(section: string): void {
    console.log('Setting active section to:', section);
    alert(`Clicked on ${section} section`); // Temporary debug alert
    this.activeSection = section;
    
    switch (section) {
      case 'users':
        console.log('Loading users...');
        this.loadUsers();
        break;
      case 'categories':
        console.log('Loading categories...');
        this.loadCategories();
        break;
      case 'products':
        console.log('Loading products...');
        this.loadProducts();
        break;
      case 'orders':
        console.log('Loading orders...');
        this.loadOrders();
        break;
      default:
        console.log('No specific loader for section:', section);
    }
  }

  private loadOverviewStats(): void {
    // Load basic stats for overview
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        this.stats.totalUsers = users.length;
        console.log('Users loaded:', users.length);
      },
      error: (error: any) => {
        console.error('Error loading users stats:', error);
        this.stats.totalUsers = 0;
      }
    });

    this.adminService.getAllCategories().subscribe({
      next: (categories: any) => {
        this.stats.totalCategories = categories.length;
        console.log('Categories loaded:', categories.length);
      },
      error: (error: any) => {
        console.error('Error loading categories stats:', error);
        this.stats.totalCategories = 0;
      }
    });

    this.adminService.getAllProducts().subscribe({
      next: (products: any) => {
        this.stats.totalProducts = products.length;
        console.log('Products loaded:', products.length);
      },
      error: (error: any) => {
        console.error('Error loading products stats:', error);
        this.stats.totalProducts = 0;
      }
    });

    // For now, set orders to 0 since we need to add the endpoint to backend
    this.stats.totalOrders = 0;
    console.log('Order stats set to 0 - endpoint needs to be added to backend');
  }

  private loadUsers(): void {
    console.log('LoadUsers method called');
    this.loading.users = true;
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        console.log('Users data received:', users);
        this.users = users;
        this.loading.users = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loading.users = false;
        this.users = [];
      }
    });
  }

  private loadCategories(): void {
    console.log('LoadCategories method called');
    this.loading.categories = true;
    this.adminService.getAllCategories().subscribe({
      next: (categories: any) => {
        console.log('Categories data received:', categories);
        this.categories = categories;
        this.loading.categories = false;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.loading.categories = false;
        this.categories = [];
      }
    });
  }

  private loadProducts(): void {
    console.log('LoadProducts method called');
    this.loading.products = true;
    this.adminService.getAllProducts().subscribe({
      next: (products: any) => {
        console.log('Products data received:', products);
        this.products = products;
        this.loading.products = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.loading.products = false;
        this.products = [];
      }
    });
  }

  private loadOrders(): void {
    this.loading.orders = true;
    
    // Note: Backend needs to add @GetMapping("/all") @PreAuthorize("hasRole('ADMIN')") to OrderController
    // For now, we'll show a message that this feature needs backend implementation
    console.log('Loading orders - this requires adding /api/order/all endpoint to OrderController');
    
    // Simulate empty orders for now
    setTimeout(() => {
      this.orders = [];
      this.loading.orders = false;
      console.log('Orders loaded (empty - backend endpoint needed)');
    }, 1000);
    
    // Uncomment this when backend adds the endpoint:
    /*
    this.adminService.getAllOrders().subscribe({
      next: (orders: any) => {
        this.orders = orders;
        this.loading.orders = false;
        console.log('Orders loaded:', orders.length);
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.loading.orders = false;
        this.orders = [];
      }
    });
    */
  }

  // User Management
  openUserModal(isEdit = false, userData: any = null): void {
    this.modals.user = {
      visible: true,
      isEdit,
      data: userData
    };
  }

  closeUserModal(): void {
    this.modals.user = {
      visible: false,
      isEdit: false,
      data: null
    };
  }

  onUserSaved(user: any): void {
    if (this.modals.user.isEdit) {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index] = user;
      }
    } else {
      this.loadUsers(); // Reload users to get the new user from server
    }
  }

  editUser(user: any): void {
    this.openUserModal(true, user);
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          this.stats.totalUsers--;
          alert('User deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      });
    }
  }

  // Category Management
  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(cat => cat.id !== id);
          this.stats.totalCategories--;
          alert('Category deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        }
      });
    }
  }

  // Product Management
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(product => product.id !== id);
          this.stats.totalProducts--;
          alert('Product deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      });
    }
  }

  // Modal Management
  openCategoryModal(isEdit = false, categoryData: any = null): void {
    this.modals.category = {
      visible: true,
      isEdit,
      data: categoryData
    };
  }

  closeCategoryModal(): void {
    this.modals.category = {
      visible: false,
      isEdit: false,
      data: null
    };
  }

  onCategorySaved(category: any): void {
    if (this.modals.category.isEdit) {
      const index = this.categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        this.categories[index] = category;
      }
    } else {
      this.categories.push(category);
      this.stats.totalCategories++;
    }
  }

  openProductModal(isEdit = false, productData: any = null): void {
    this.modals.product = {
      visible: true,
      isEdit,
      data: productData
    };
  }

  closeProductModal(): void {
    this.modals.product = {
      visible: false,
      isEdit: false,
      data: null
    };
  }

  onProductSaved(product: any): void {
    if (this.modals.product.isEdit) {
      const index = this.products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        this.products[index] = product;
      }
    } else {
      this.products.push(product);
      this.stats.totalProducts++;
    }
  }

  editCategory(category: any): void {
    this.openCategoryModal(true, category);
  }

  editProduct(product: any): void {
    this.openProductModal(true, product);
  }

  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  // Order Management Methods
  updateOrderStatus(orderId: number, event: any): void {
    const newStatus = event.target.value;
    
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        // Update the order status in the local array
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus;
        }
        alert(`Order status updated to ${newStatus}`);
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
        // Revert the select value
        event.target.value = this.orders.find(o => o.id === orderId)?.status || 'PENDING';
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.adminService.getOrderById(orderId).subscribe({
      next: (order: any) => {
        // Create a detailed view modal or navigate to order details
        alert(`Order Details:\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nTotal: ${this.formatCurrency(order.totalAmount)}\nStatus: ${order.status}\nItems: ${JSON.stringify(order.items, null, 2)}`);
      },
      error: (error: any) => {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details');
      }
    });
  }

  downloadInvoice(orderId: number): void {
    // Create a link to download invoice
    const link = document.createElement('a');
    link.href = `http://localhost:8056/api/order/invoice/${orderId}`;
    link.setAttribute('download', `invoice_${orderId}.txt`);
    link.setAttribute('target', '_blank');
    
    // Add authorization header by creating a fetch request instead
    const token = this.authService.token;
    fetch(`http://localhost:8056/api/order/invoice/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice_${orderId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}