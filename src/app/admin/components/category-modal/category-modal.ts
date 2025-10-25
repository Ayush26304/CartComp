import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-category-modal',
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{isEdit ? 'Edit Category' : 'Add New Category'}}</h3>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="modal-form">
          <div class="form-group">
            <label for="name">Category Name</label>
            <input 
              type="text" 
              id="name"
              [(ngModel)]="category.name" 
              name="name"
              required 
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea 
              id="description"
              [(ngModel)]="category.description" 
              name="description"
              rows="3" 
              class="form-input"
            ></textarea>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="onClose()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
        
        &:hover {
          color: #2c3e50;
        }
      }
    }

    .modal-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #2c3e50;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #3498db;
        }
      }
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;

      .btn-secondary {
        background: #95a5a6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #7f8c8d;
        }
      }

      .btn-primary {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #2980b9;
        }

        &:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
      }
    }
  `],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class CategoryModalComponent {
  @Input() isVisible = false;
  @Input() isEdit = false;
  @Input() categoryData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  category = {
    id: null,
    name: '',
    description: ''
  };
  
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnChanges() {
    if (this.categoryData) {
      this.category = { ...this.categoryData };
    } else {
      this.category = { id: null, name: '', description: '' };
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.category.name.trim()) return;

    this.loading = true;
    const operation = this.isEdit 
      ? this.adminService.updateCategory(this.category.id!, this.category)
      : this.adminService.addCategory(this.category);

    operation.subscribe({
      next: (result) => {
        this.loading = false;
        this.save.emit(result);
        this.onClose();
      },
      error: (error) => {
        console.error('Error saving category:', error);
        this.loading = false;
        alert('Failed to save category');
      }
    });
  }
}
