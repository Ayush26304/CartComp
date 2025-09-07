import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrl:'./signup.scss',
  imports:[FormsModule,RouterLink]
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