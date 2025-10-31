import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  isFavorite?: boolean; // Optional property for UI state
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = 'http://localhost:8056/api/catalog';
  
  constructor(private http: HttpClient, private auth: AuthService) {}
 
  // Get all categories
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/category`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Get category by ID
  getCategoryById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/category/${id}`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Add new category (Admin only)
  addCategory(category: CategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${this.baseUrl}/category`, category, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Update category (Admin only)
  updateCategory(id: number, category: CategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.baseUrl}/category/${id}`, category, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Delete category (Admin only)
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/category/${id}`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Get all products
  getAllProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/product`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }
 
  // Get products by category
  getProductsByCategory(categoryId: number): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/product/category/${categoryId}`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }
   
  // Get product by ID
  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/product/${id}`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Add new product (Admin only)
  addProduct(product: ProductDto): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.baseUrl}/product`, product, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Update product (Admin only)
  updateProduct(id: number, product: ProductDto): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.baseUrl}/product/${id}`, product, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Delete product (Admin only)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/product/${id}`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Reduce product stock
  reduceStock(id: number, quantity: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/product/reduce-stock/${id}?quantity=${quantity}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Search products
  searchProducts(keyword: string): Observable<ProductDto[]> {
    const searchUrl = `${this.baseUrl}/product/search?keyword=${encodeURIComponent(keyword)}`;
    
    return this.http.get<ProductDto[]>(searchUrl, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Get latest products from backend /latest endpoint
  getLatestProducts(limit: number = 10): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.baseUrl}/product/latest`, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  // Add to cart through categories service (for consistency)
  addToCart(productId: number, quantity: number = 1): Observable<any> {
    const cartItem = {
      productId: productId,
      quantity: quantity
    };
    
    return this.http.post(`http://localhost:8056/api/cart`, cartItem, {
      headers: { Authorization: `Bearer ${this.auth.token}` },
      responseType: 'text' as 'json'
    });
  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

 
// @Injectable({
//   providedIn: 'root'
// })
// export class CategoriesService {
  
//   private baseUrl = 'http://localhost:8056/api/catalog';
  
  

//   constructor(private http: HttpClient) { if (!this.isBrowser()) return;}
 
  
//    getCategories(): Observable<string[]> {
//      if (!this.isBrowser()) return new Observable<string[]>(observer => observer.complete());
//     const token = localStorage.getItem('token'); // Or however you store your JWT
//      console.log('JWT Token:', token);
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`
//     });

//     return this.http.get<string[]>(`${this.baseUrl}/category`, { headers });
//   }

//   getProductsByCategory(category: string): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/category/1`);
//   }
   
//   getProductById(id:number):Observable<any>{
//     return this.http.get<any>(`${this.baseUrl}/${id}`);
//   }
//    private isBrowser(): boolean {
//     return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
//   }

// }