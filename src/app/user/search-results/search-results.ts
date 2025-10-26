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
  categories: CategoryDto[] = [];
  filteredProducts: (ProductDto & { isFavorite: boolean })[] = [];
  loading = false;
  backendResultsLoaded = false;
  showBuffering = false;
  error: string | null = null;
  
  // Filter options
  selectedCategories: number[] = [];
  selectedPriceRange: string = 'all';
  sortBy: string = 'name';
  
  // Price ranges
  priceRanges = [
    { label: 'All Prices', value: 'all', min: 0, max: Infinity },
    { label: 'Under ₹500', value: 'under500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', value: '500to1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', value: '1000to2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', value: '2000to5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', value: 'above5000', min: 5000, max: Infinity }
  ];

  // Sort options
  sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Price (High to Low)', value: 'price_desc' }
  ];

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
      if (this.searchQuery) {
        this.searchProducts();
      }
    });

    // Load categories for filter
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories. Please try again.';
      }
    });
  }

  searchProducts(): void {
    // Clear previous error
    this.error = null;
    
    // Check if search query is "print" to show buffering
    if (this.searchQuery.toLowerCase().includes('print')) {
      this.showBuffering = true;
      this.loading = true;
      this.backendResultsLoaded = false;
    } else {
      this.loading = true;
      this.backendResultsLoaded = false;
    }

    this.categoriesService.searchProducts(this.searchQuery).subscribe({
      next: (products) => {
        this.products = products.map(product => ({
          ...product,
          isFavorite: false
        }));
        
        // Reset filters when new backend results arrive
        this.selectedCategories = [];
        this.selectedPriceRange = 'all';
        this.sortBy = 'name';
        
        this.applyFilters();
        this.loading = false;
        this.showBuffering = false;
        this.backendResultsLoaded = true;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.error = 'Failed to search products. Please try again.';
        this.loading = false;
        this.showBuffering = false;
        this.backendResultsLoaded = true;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Category filter
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        this.selectedCategories.includes(product.categoryId)
      );
    }

    // Price range filter
    if (this.selectedPriceRange !== 'all') {
      const range = this.priceRanges.find(r => r.value === this.selectedPriceRange);
      if (range) {
        filtered = filtered.filter(product => 
          product.price >= range.min && product.price < range.max
        );
      }
    }

    // Sort products
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    this.filteredProducts = filtered;
  }

  onCategoryFilterChange(categoryId: number, event: any): void {
    if (event.target.checked) {
      this.selectedCategories.push(categoryId);
    } else {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.selectedPriceRange = 'all';
    this.sortBy = 'name';
    this.applyFilters();
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
