import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { CategoriesService, CategoryDto, ProductDto } from '../pages/categoriesservice';
import { CartService } from '../cartservice';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss'],
  imports: [CommonModule, FormsModule, NavbarComponent],
  standalone: true
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  products: (ProductDto & { isFavorite: boolean })[] = [];
  loading = false;
  error = '';
  


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery.trim()) {
        this.searchProducts();
      }
    });
  }

  searchProducts(): void {
    if (!this.searchQuery.trim()) return;
    
    this.loading = true;
    this.error = '';
    this.products = [];
    
    this.categoriesService.searchProducts(this.searchQuery.trim()).subscribe({
      next: (products) => {
        this.products = products.map(product => ({
          ...product,
          isFavorite: false
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.error = 'Failed to search products. Please try again.';
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
    const action = product.isFavorite ? 'added to' : 'removed from';
    console.log(`${product.name} ${action} favorites`);
  }

  newSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() }
      });
    }
  }
}
