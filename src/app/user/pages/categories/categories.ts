import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CategoriesService, CategoryDto, ProductDto } from '../categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { NavigationService } from '../../../shared/services/navigation.service';
import { CartService } from '../../cartservice';
import { WishlistService } from '../../wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  standalone: true
})
export class CategoriesComponent implements OnInit, OnDestroy {
  @Input() isChildComponent: boolean = false;
  categories: CategoryDto[] = [];
  products: (ProductDto & { isFavorite: boolean })[] = [];
  selectedCategory: CategoryDto | null = null;
  loading = false;
  showNavbar: boolean = true;
  private wishlistSubscription: Subscription = new Subscription();
  
  constructor(
    private categoriesService: CategoriesService, 
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}
 
  ngOnInit(): void {
    // Check if this component is being used as a child component
    this.showNavbar = !this.isChildComponent;
    console.log('Categories component - isChildComponent:', this.isChildComponent, 'showNavbar:', this.showNavbar);
    this.loadCategories();
    
    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      this.updateProductWishlistStatus();
    });
  }

  ngOnDestroy(): void {
    this.wishlistSubscription.unsubscribe();
  }
 
  loadCategories(): void {
    this.loading = true;
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories loaded:', data);
        this.categories = data;
        if (data.length > 0) {
          this.loadProducts(data[0]);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }
 
  loadProducts(category: CategoryDto): void {
    this.selectedCategory = category;
    this.loading = true;
    this.categoriesService.getProductsByCategory(category.id).subscribe({
      next: (data) => {
        console.log('Products loaded:', data);
        this.products = data.map(product => ({
          ...product,
          isFavorite: this.wishlistService.isInWishlist(product.id)
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  openProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  addToCart(product: ProductDto): void {
    const cartItem = {
      id: product.id,
      image: product.imageUrl,
      title: product.name,
      price: product.price
    };
    
    this.cartService.addToCart(cartItem, 1).subscribe({
      next: (response) => {
        alert(`${product.name} added to cart!`);
        console.log('Add to cart response:', response);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert(`Failed to add ${product.name} to cart. Please try again.`);
      }
    });
  }

  toggleFavorite(product: ProductDto & { isFavorite: boolean }): void {
    this.wishlistService.toggleWishlist(product.id).subscribe({
      next: () => {
        const isInWishlist = this.wishlistService.isInWishlist(product.id);
        product.isFavorite = isInWishlist;
        
        const action = isInWishlist ? 'added to' : 'removed from';
        alert(`${product.name} ${action} wishlist successfully!`);
      },
      error: (error) => {
        console.error('Error toggling wishlist:', error);
        alert('Failed to update wishlist. Please try again.');
      }
    });
  }

  updateProductWishlistStatus(): void {
    // Update wishlist status for all products
    this.products.forEach(product => {
      product.isFavorite = this.wishlistService.isInWishlist(product.id);
    });
  }
}
