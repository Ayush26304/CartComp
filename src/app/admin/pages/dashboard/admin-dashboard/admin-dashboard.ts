import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService, OrderResponseDto } from '../../../admin.service';
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
  orders: OrderResponseDto[] = [];

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
    this.activeSection = section;
    
    switch (section) {
      case 'users':
        this.loadUsers();
        break;
      case 'categories':
        this.loadCategories();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'orders':
        this.loadOrders();
        break;
    }
  }

  private loadOverviewStats(): void {
    // Load basic stats for overview
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
        this.stats.totalUsers = users.length;
      },
      error: (error: any) => {
        console.error('Error loading users stats:', error);
        this.stats.totalUsers = 0;
      }
    });

    this.adminService.getAllCategories().subscribe({
      next: (categories: any) => {
        this.stats.totalCategories = categories.length;
      },
      error: (error: any) => {
        console.error('Error loading categories stats:', error);
        this.stats.totalCategories = 0;
      }
    });

    this.adminService.getAllProducts().subscribe({
      next: (products: any) => {
        this.stats.totalProducts = products.length;
      },
      error: (error: any) => {
        console.error('Error loading products stats:', error);
        this.stats.totalProducts = 0;
      }
    });

    // Load orders stats
    this.adminService.getAllOrders().subscribe({
      next: (orders: any) => {
        this.stats.totalOrders = orders.length;
      },
      error: (error: any) => {
        console.error('Error loading order stats:', error);
        this.stats.totalOrders = 0;
      }
    });
  }

  private loadUsers(): void {
    this.loading.users = true;
    this.userService.getAllUsers().subscribe({
      next: (users: any) => {
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
    this.loading.categories = true;
    this.adminService.getAllCategories().subscribe({
      next: (categories: any) => {
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
    this.loading.products = true;
    this.adminService.getAllProducts().subscribe({
      next: (products: any) => {
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
    
    this.adminService.getAllOrders().subscribe({
      next: (orders: any) => {
        this.orders = orders;
        this.loading.orders = false;
        this.stats.totalOrders = orders.length;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.loading.orders = false;
        this.orders = [];
        // If the endpoint doesn't exist, show a helpful message
        if (error.status === 404) {
          console.log('Order admin endpoint not found - backend needs admin order endpoints');
        }
      }
    });
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
        const orderIndex = this.orders.findIndex(order => order.orderId === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus;
        }
        alert(`Order status updated to ${newStatus}`);
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
        // Revert the select value
        event.target.value = this.orders.find(o => o.orderId === orderId)?.status || 'PENDING';
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.adminService.getOrderById(orderId).subscribe({
      next: (order: OrderResponseDto) => {
        // Create a detailed view modal or navigate to order details
        const itemsText = order.items.map(item => 
          `${item.productName} x${item.quantity} @ ₹${item.price}`
        ).join('\n');
        
        alert(`Order Details:\n\n` +
              `Order ID: ${order.orderId}\n` +
              `Invoice: ${order.invoiceNumber}\n` +
              `Customer: ${order.shipping.fullName}\n` +
              `Phone: ${order.shipping.phone}\n` +
              `Address: ${order.shipping.address}, ${order.shipping.city}\n` +
              `Total: ${this.formatCurrency(order.totalAmount)}\n` +
              `Status: ${order.status}\n` +
              `Date: ${order.orderDate}\n\n` +
              `Items:\n${itemsText}`);
      },
      error: (error: any) => {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details');
      }
    });
  }

  // Delete order method
  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      this.adminService.deleteOrder(orderId).subscribe({
        next: () => {
          this.orders = this.orders.filter(order => order.orderId !== orderId);
          this.stats.totalOrders--;
          alert('Order deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting order:', error);
          alert('Failed to delete order. Only cancelled orders can be deleted.');
        }
      });
    }
  }

  downloadInvoice(orderId: number): void {
    this.adminService.downloadOrderInvoice(orderId);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}