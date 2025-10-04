import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

 
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = 'https://fakestoreapi.com/products';
  
  

  constructor(private http: HttpClient) {}
 
  
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }
 
  
  getProductsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/category/${category}`);
  }
   
  getProductById(id:number):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }


}