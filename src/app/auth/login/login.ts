import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports:[ReactiveFormsModule,CommonModule, RouterLink, FormsModule, RouterLinkActive]
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
    //  create form controls
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
     // role: ['user', Validators.required]  
    });
  }
 
  login() {
    
    console.log(this.loginForm.value);
    if (this.loginForm.invalid) {
      this.error = 'Please fill all fields';
      return;
    }
 
  const { username, password } = this.loginForm.value;

this.authService.login(username, password).subscribe({
  next: () => {
    // Navigate based on role
    const role = this.authService.role;
    if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  },
  error: () => {
    this.error = 'Login failed. Please try again.';
  }
});

  }
}