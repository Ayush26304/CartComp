import { Component, OnInit, Input } from '@angular/core';
import { CategoriesService, CategoryDto, ProductDto } from '../categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { NavigationService } from '../../../shared/services/navigation.service';
import { CartService } from '../../cartservice';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [FormsModule, CommonModule, NavbarComponent],
  standalone: true
})
export class CategoriesComponent implements OnInit {
  @Input() isChildComponent: boolean = false;
  categories: CategoryDto[] = [];
  products: (ProductDto & { isFavorite: boolean })[] = [];
  selectedCategory: CategoryDto | null = null;
  loading = false;
  showNavbar: boolean = true;
  
  constructor(
    private categoriesService: CategoriesService, 
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private cartService: CartService
  ) {}
 
  ngOnInit(): void {
    // Check if this component is being used as a child in home
    this.showNavbar = !this.isChildComponent && !this.route.parent;
    this.loadCategories();
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
          isFavorite: false
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
    product.isFavorite = !product.isFavorite;
    // TODO: Implement favorites service
    const action = product.isFavorite ? 'added to' : 'removed from';
    console.log(`${product.name} ${action} favorites`);
  }
}
