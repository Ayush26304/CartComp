
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService, ProductDto } from '../pages/categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../cartservice';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-product',
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './product.html',
  styleUrl: './product.scss',
  standalone: true
})
export class ProductDescriptionComponent implements OnInit {
  @Input() isChildComponent: boolean = false;
  product: ProductDto | null = null;
  quantity: number = 1;
  quantityOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  loading = true;
  selectedImageIndex = 0;
  isFavorite = false;
  showNavbar: boolean = true;
  
  // Mock additional product images for demonstration
  additionalImages: string[] = [];
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoriesService,
    private cartservice: CartService
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
          // Generate additional mock images for carousel
          this.generateAdditionalImages();
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
        }
      });
    }
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
    this.isFavorite = !this.isFavorite;
    // TODO: Implement favorites service
    const action = this.isFavorite ? 'added to' : 'removed from';
    console.log(`Product ${action} favorites`);
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