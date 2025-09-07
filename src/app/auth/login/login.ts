import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports:[ReactiveFormsModule,CommonModule, RouterLink]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    //  create form controls
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['user', Validators.required]  // default user
    });
  }
 
  login() {
    
    console.log(this.loginForm.value);
    if (this.loginForm.invalid) {
      this.error = 'Please fill all fields';
      return;
    }
 
    const { username, password, role } = this.loginForm.value;
    alert(`Login clicked: ${username}, ${role}`); // debug
 
    const success = this.authService.login(username, password,role);   //, role
    if (success) {
      this.router.navigate([role === 'admin' ? '/admin' : '/home']);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}