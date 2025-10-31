import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
    imports:[ReactiveFormsModule,CommonModule, RouterLink, FormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string = '';

  ngOnInit(): void {
    
  }
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Create form controls - role is determined by backend JWT
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
 
  login() {
    // Clear previous errors
    this.error = '';
    
    console.log('Login attempt:', this.loginForm.value);
    
    if (this.loginForm.invalid) {
      this.error = 'Please fill all fields correctly';
      return;
    }
 
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        console.log('Login successful');
        const role = this.authService.role;
        console.log('User role:', role);
        
        // Navigate based on role from JWT token
        if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = 'Invalid username or password. Please try again.';
      }
    });
  }
}