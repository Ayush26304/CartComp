import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports:[FormsModule,CommonModule]

})
export class CategoriesComponent implements OnInit {
  categories: string[] = [];
  products: any[] = [];
  selectedCategory: string | null = null;
  
  

  constructor(private categoriesService: CategoriesService ,private router:Router) {}
 
  ngOnInit(): void {
    this.loadCategories();
  }
 
  loadCategories(): void {
    this.categoriesService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }
 
  loadProducts(category: string): void {
    this.selectedCategory = category;
    this.categoriesService.getProductsByCategory(category).subscribe(data => {
      this.products = data;
    });
  }

 openProduct(id:number):void{
  this.router.navigate(['/product',id]);
 }


 addToCart(products:any){
  alert(`${products.title} is added to cart `);
 }
}