
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService, ProductDto } from '../pages/categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../cartservice';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { WishlistService } from '../wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product',
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './product.html',
  styleUrl: './product.scss',
  standalone: true
})
export class ProductDescriptionComponent implements OnInit, OnDestroy {
  @Input() isChildComponent: boolean = false;
  product: ProductDto | null = null;
  quantity: number = 1;
  quantityOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  loading = true;
  selectedImageIndex = 0;
  isFavorite = false;
  showNavbar: boolean = true;
  private wishlistSubscription: Subscription = new Subscription();
  
  // Mock additional product images for demonstration
  additionalImages: string[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoriesService,
    private cartservice: CartService,
    private wishlistService: WishlistService
  ) {}
 
  ngOnInit(): void {
    // Show navbar unless explicitly used as child component
    this.showNavbar = !this.isChildComponent;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
          this.loading = false;
          // Check if product is in wishlist
          this.isFavorite = this.wishlistService.isInWishlist(res.id);
          // Generate additional mock images for carousel
          this.generateAdditionalImages();
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
        }
      });
    }

    // Subscribe to wishlist changes
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      if (this.product) {
        this.isFavorite = this.wishlistService.isInWishlist(this.product.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.wishlistSubscription.unsubscribe();
  }

  generateAdditionalImages(): void {
    if (this.product?.imageUrl) {
      this.additionalImages = [
        this.product.imageUrl,
        this.product.imageUrl + '?variant=1',
        this.product.imageUrl + '?variant=2',
        this.product.imageUrl + '?variant=3'
      ];
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleFavorite(): void {
    if (!this.product) return;
    
    // Immediately update UI for smooth experience
    this.isFavorite = !this.isFavorite;
    
    this.wishlistService.toggleWishlist(this.product.id).subscribe({
      next: () => {
        const action = this.isFavorite ? 'added to' : 'removed from';
        alert(`${this.product!.name} ${action} wishlist successfully!`);
      },
      error: (error) => {
        // Revert the UI change if the request failed
        this.isFavorite = !this.isFavorite;
        console.error('Error toggling wishlist:', error);
        alert('Failed to update wishlist. Please try again.');
      }
    });
  }

  navigateToShop(): void {
    this.router.navigate(['/categories']);
  }

  addToCart(): void {
    if (this.cartservice && this.product) {
      const cartItem = {
        id: this.product.id,
        image: this.product.imageUrl,
        title: this.product.name,
        price: this.product.price
      };
      
      this.cartservice.addToCart(cartItem, this.quantity).subscribe({
        next: (response) => {
          alert(`${this.product?.name} added to cart successfully!`);
          console.log('Add to cart response:', response);
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          alert(`Failed to add ${this.product?.name} to cart. Please try again.`);
        }
      });
    }
  }
 
  buyNow(): void {
    if (this.product) {
      // Add to cart first, then navigate to checkout
      this.addToCart();
      this.router.navigate(['/checkout']);
    }
  }

  shareProduct(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.name,
        text: this.product.description,
        url: window.location.href
      });
    } else {
      // Fallback: Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  }

  getTomorrowDate(): Date {
    return new Date(Date.now() + 86400000); // Add 24 hours (86400000 ms)
  }
}