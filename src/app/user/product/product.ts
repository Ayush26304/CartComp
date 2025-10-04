
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../pages/categoriesservice';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../cartservice';

 
@Component({
  selector: 'app-product',
  imports: [FormsModule,CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductDescriptionComponent implements OnInit {
  product: any;
  quantity: number = 1;
  quantityOptions: number[] = [1, 2, 3, 4, 5];
  loading = true;
 
  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoriesService,
    private cartservice: CartService
  ) {}
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryService.getProductById(+id).subscribe({
        next: (res) => {
          this.product = res;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }
  
  navigatetoshop(){
    
  }
  

  addToCart() {
    
    if(this.cartservice && this.product){
      this.cartservice.addToCart({id: this.product.id,image:this.product.image,title:this.product.title,price:this.product.price},this.quantity);
     alert(`${this.product.title} added to cart  successfully!`);
    }
    

  }
 
  buyNow() {
    alert(`Proceeding to buy ${this.product.title}`);
  }
}