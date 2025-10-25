import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfileDto, MinimalProfileDto, UpdateProfileDto } from '../../services/user.service';

@Component({
  selector: 'app-user-modal',
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{isEdit ? 'Edit User' : 'Add New User'}}</h3>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="modal-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4>Basic Information</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName"
                  [(ngModel)]="userForm.firstName" 
                  name="firstName"
                  required 
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName"
                  [(ngModel)]="userForm.lastName" 
                  name="lastName"
                  required 
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-row" *ngIf="!isEdit">
              <div class="form-group">
                <label for="username">Username *</label>
                <input 
                  type="text" 
                  id="username"
                  [(ngModel)]="userForm.username" 
                  name="username"
                  required 
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email"
                  [(ngModel)]="userForm.email" 
                  name="email"
                  required 
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-group" *ngIf="!isEdit">
              <label for="password">Password *</label>
              <input 
                type="password" 
                id="password"
                [(ngModel)]="userForm.password" 
                name="password"
                required 
                class="form-input"
              >
            </div>
          </div>

          <!-- Contact Information -->
          <div class="form-section">
            <h4>Contact Information</h4>
            
            <div class="form-group">
              <label for="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                id="phoneNumber"
                [(ngModel)]="userForm.phoneNumber" 
                name="phoneNumber"
                class="form-input"
              >
            </div>
            
            <div class="form-group">
              <label for="address">Address</label>
              <textarea 
                id="address"
                [(ngModel)]="userForm.address" 
                name="address"
                rows="2" 
                class="form-input"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input 
                  type="text" 
                  id="city"
                  [(ngModel)]="userForm.city" 
                  name="city"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="state">State</label>
                <input 
                  type="text" 
                  id="state"
                  [(ngModel)]="userForm.state" 
                  name="state"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="zipCode">Zip Code</label>
                <input 
                  type="text" 
                  id="zipCode"
                  [(ngModel)]="userForm.zipCode" 
                  name="zipCode"
                  class="form-input"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="dateOfBirth">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth"
                [(ngModel)]="userForm.dateOfBirth" 
                name="dateOfBirth"
                class="form-input"
              >
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="onClose()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="loading || !isFormValid()">
              {{loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}}
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
      width: 95%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.3rem;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        
        &:hover {
          background: #e9ecef;
          color: #2c3e50;
        }
      }
    }

    .modal-form {
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
      
      h4 {
        margin: 0 0 1rem 0;
        color: #34495e;
        font-size: 1.1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #3498db;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        &:invalid {
          border-color: #e74c3c;
        }
      }

      textarea.form-input {
        resize: vertical;
        min-height: 60px;
      }
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;

      .btn-secondary {
        background: #95a5a6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;

        &:hover {
          background: #7f8c8d;
        }
      }

      .btn-primary {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;

        &:hover:not(:disabled) {
          background: #2980b9;
        }

        &:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
      }
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 98%;
        margin: 1rem;
      }

      .modal-form {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class UserModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isEdit = false;
  @Input() userData: UserProfileDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  userForm: any = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    password: ''
  };
  
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.resetForm();
  }

  ngOnChanges() {
    if (this.userData && this.isEdit) {
      this.userForm = {
        ...this.userData,
        dateOfBirth: this.userData.dateOfBirth ? 
          new Date(this.userData.dateOfBirth).toISOString().split('T')[0] : '',
        password: '' // Don't pre-fill password for edit
      };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.userForm = {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      password: ''
    };
  }

  isFormValid(): boolean {
    if (this.isEdit) {
      return !!(this.userForm.firstName?.trim() && this.userForm.lastName?.trim());
    } else {
      return !!(
        this.userForm.username?.trim() && 
        this.userForm.email?.trim() && 
        this.userForm.firstName?.trim() && 
        this.userForm.lastName?.trim() &&
        this.userForm.password?.trim()
      );
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.loading = true;

    if (this.isEdit) {
      // Update existing user
      const updateData: UpdateProfileDto = {
        firstName: this.userForm.firstName,
        lastName: this.userForm.lastName,
        phoneNumber: this.userForm.phoneNumber,
        address: this.userForm.address,
        city: this.userForm.city,
        state: this.userForm.state,
        zipCode: this.userForm.zipCode,
        dateOfBirth: this.userForm.dateOfBirth
      };

      this.userService.updateUser(this.userData!.id, updateData).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.save.emit({ ...this.userData, ...updateData });
          alert('User updated successfully');
          this.onClose();
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          this.loading = false;
          alert('Failed to update user');
        }
      });
    } else {
      // Create new user
      const newUser: MinimalProfileDto = {
        username: this.userForm.username,
        email: this.userForm.email,
        firstName: this.userForm.firstName,
        lastName: this.userForm.lastName,
        password: this.userForm.password
      };

      this.userService.createMinimalProfile(newUser).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.save.emit(newUser);
          alert('User created successfully');
          this.onClose();
        },
        error: (error: any) => {
          console.error('Error creating user:', error);
          this.loading = false;
          alert('Failed to create user');
        }
      });
    }
  }
}
