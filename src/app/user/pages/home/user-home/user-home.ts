import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CategoriesService, ProductDto } from '../../../pages/categoriesservice';
import { CartService } from '../../../cartservice';
import { WishlistService } from '../../../wishlist.service';
import { Subscription } from 'rxjs';

 
@Component({
  selector: 'app-home',
  templateUrl: './user-home.html',
  imports:[NavbarComponent, FooterComponent, CommonModule, FormsModule, RouterOutlet],
  styleUrl:'./user-home.scss'
})
export class UserHome implements OnInit, OnDestroy {
  latestProducts: ProductDto[] = [];
  favoriteProducts: ProductDto[] = [];
  loadingProducts = true;
  loadingFavorites = true;
  private wishlistSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private categoriesService: CategoriesService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loadLatestProducts();
    this.loadFavoriteProducts();
    
    // Subscribe to wishlist changes for smooth updates
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe((wishlistItems) => {
      console.log('Home: Wishlist changed, items count:', wishlistItems?.length || 0);
      this.updateProductWishlistStatus();
      this.syncFavoriteProductsWithWishlist(wishlistItems);
    });
  }

  ngOnDestroy(): void {
    this.wishlistSubscription.unsubscribe();
  }

  loadLatestProducts(): void {
    console.log('🚀 Loading latest products from /latest endpoint...');
    
    this.categoriesService.getLatestProducts(10).subscribe({
      next: (products) => {
        console.log('📦 Received latest products from backend:', products.length, 'products');
        console.log('🎯 Latest Products IDs:', products.map(p => p.id));
        
        // Backend already returns top 10 latest products sorted by ID desc
        this.latestProducts = products;
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('❌ Error loading latest products:', error);
        this.loadingProducts = false;
      }
    });
  }

  navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
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
        alert(`${product.name} added to cart successfully!`);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert(`Failed to add ${product.name} to cart. Please try again.`);
      }
    });
  }

  toggleFavorite(product: ProductDto): void {
    // Immediately update UI for smooth experience
    product.isFavorite = !product.isFavorite;
    
    this.wishlistService.toggleWishlist(product.id).subscribe({
      next: () => {
        const action = product.isFavorite ? 'added to' : 'removed from';
        alert(`${product.name} ${action} wishlist successfully!`);
        // The wishlist subscription will handle updating the favorites section
      },
      error: (error) => {
        // Revert the UI change if the request failed
        product.isFavorite = !product.isFavorite;
        console.error('Error toggling wishlist:', error);
        alert('Failed to update wishlist. Please try again.');
      }
    });
  }

  loadFavoriteProducts(): void {
    this.loadingFavorites = true;
    
    if (!this.wishlistService) {
      console.error('WishlistService is not available in home component');
      this.favoriteProducts = [];
      this.loadingFavorites = false;
      return;
    }
    
    // Use the current wishlist from the service's cache
    const wishlistItems = this.wishlistService.getCurrentWishlist();
    
    // Handle null or empty wishlist
    if (!wishlistItems || wishlistItems.length === 0) {
      this.favoriteProducts = [];
      this.loadingFavorites = false;
      return;
    }

    // Get product details for each wishlist item
    const productRequests = wishlistItems.map(item => 
      this.categoriesService.getProductById(item.productId)
    );

    // Wait for all product details
    Promise.all(productRequests.map(req => req.toPromise())).then(products => {
      this.favoriteProducts = products.filter(p => p != null) as ProductDto[];
      this.favoriteProducts.forEach(product => product.isFavorite = true);
      this.loadingFavorites = false;
    }).catch(error => {
      console.error('Error loading favorite product details:', error);
      this.favoriteProducts = [];
      this.loadingFavorites = false;
    });
  }

  updateProductWishlistStatus(): void {
    // Update wishlist status for latest products
    this.latestProducts.forEach(product => {
      product.isFavorite = this.wishlistService.isInWishlist(product.id);
    });

    // Update wishlist status for favorite products
    this.favoriteProducts.forEach(product => {
      product.isFavorite = this.wishlistService.isInWishlist(product.id);
    });
  }

  // Sync favorite products with wishlist changes - complete rebuild to avoid duplicates
  private syncFavoriteProductsWithWishlist(wishlistItems: any[]): void {
    if (!wishlistItems || wishlistItems.length === 0) {
      console.log('Home: Clearing favorites - empty wishlist');
      this.favoriteProducts = [];
      return;
    }

    const wishlistProductIds = wishlistItems.map(w => w.productId).sort();
    const currentFavoriteIds = this.favoriteProducts.map(f => f.id).sort();
    
    console.log('Home: Syncing favorites - wishlist IDs:', wishlistProductIds, 'current IDs:', currentFavoriteIds);
    
    // Check if the wishlist has actually changed to avoid unnecessary rebuilds
    if (wishlistProductIds.length === currentFavoriteIds.length && 
        wishlistProductIds.every((id, index) => id === currentFavoriteIds[index])) {
      console.log('Home: No changes needed - wishlist matches favorites');
      return; // No changes needed
    }
    
    console.log('Home: Rebuilding favorites from wishlist');
    
    // Rebuild the favorites list from wishlist to ensure no duplicates
    const productRequests = wishlistProductIds.map(id => 
      this.categoriesService.getProductById(id)
    );

    Promise.all(productRequests.map(req => req.toPromise())).then(products => {
      const validProducts = products.filter(p => p != null) as ProductDto[];
      validProducts.forEach(product => product.isFavorite = true);
      
      console.log('Home: Favorites updated, count:', validProducts.length);
      
      // Replace the entire favorites array to prevent duplicates
      this.favoriteProducts = validProducts;
    }).catch(error => {
      console.error('Error syncing favorite products:', error);
      this.favoriteProducts = [];
    });
  }
}