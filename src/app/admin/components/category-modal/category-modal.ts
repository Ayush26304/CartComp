import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.html',
  styleUrls: ['./category-modal.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CategoryModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isEdit = false;
  @Input() categoryData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  category = {
    id: null as number | null,
    name: '',
    description: ''
  };

  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    if (this.isEdit && this.categoryData) {
      this.category = { ...this.categoryData };
    } else {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.category = {
      id: null,
      name: '',
      description: ''
    };
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSave(): void {
    if (!this.category.name.trim()) {
      alert('Category name is required');
      return;
    }

    this.loading = true;

    if (this.isEdit && this.category.id !== null) {
      this.adminService.updateCategory(this.category.id, this.category).subscribe({
        next: (response) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating category:', error);
          alert('Failed to update category');
        }
      });
    } else {
      this.adminService.createCategory(this.category).subscribe({
        next: (response) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating category:', error);
          alert('Failed to create category');
        }
      });
    }
  }
}
