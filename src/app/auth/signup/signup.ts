import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrl:'./signup.scss',
  imports:[FormsModule]
})
export class SignupComponent {
  username = '';
  password = '';
 
  constructor(private authService: AuthService, private router: Router) {}
 
  signup() {
    this.authService.signup(this.username, this.password);
    alert('Signup successful! Please login.');
    this.router.navigate(['/login']);
  }
}