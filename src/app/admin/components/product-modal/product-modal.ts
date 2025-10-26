import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.html',
  styleUrls: ['./product-modal.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ProductModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isEdit = false;
  @Input() productData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  product = {
    id: null as number | null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: null as number | null,
    imageUrl: ''
  };

  categories: any[] = [];
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCategories();
    
    if (this.isEdit && this.productData) {
      this.product = { ...this.productData };
    } else {
      this.resetForm();
    }
  }

  loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  resetForm(): void {
    this.product = {
      id: null,
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: null,
      imageUrl: ''
    };
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSave(): void {
    if (!this.product.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!this.product.categoryId) {
      alert('Please select a category');
      return;
    }

    if (this.product.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    this.loading = true;

    if (this.isEdit && this.product.id !== null) {
      this.adminService.updateProduct(this.product.id, this.product).subscribe({
        next: (response) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating product:', error);
          alert('Failed to update product');
        }
      });
    } else {
      this.adminService.createProduct(this.product).subscribe({
        next: (response) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating product:', error);
          alert('Failed to create product');
        }
      });
    }
  }
}
