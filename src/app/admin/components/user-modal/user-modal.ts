import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.html',
  styleUrls: ['./user-modal.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class UserModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isEdit = false;
  @Input() userData: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  user = {
    id: null as number | null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  };

  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    if (this.isEdit && this.userData) {
      this.user = { ...this.userData };
    } else {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.user = {
      id: null,
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    };
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onSave(): void {
    if (!this.user.username.trim()) {
      alert('Username is required');
      return;
    }

    if (!this.user.firstName.trim()) {
      alert('First name is required');
      return;
    }

    this.loading = true;

    if (this.isEdit && this.user.id !== null) {
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error updating user:', error);
          alert('Failed to update user');
        }
      });
    } else {
      this.userService.createUser(this.user).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.save.emit(response);
          this.onClose();
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error creating user:', error);
          alert('Failed to create user');
        }
      });
    }
  }
}
