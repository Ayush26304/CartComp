import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports:[FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';
  role = 'user';
  error = '';
 
  constructor(private authService: AuthService, private router: Router) {}
 
  login() {
    const success = this.authService.login(this.username, this.password, this.role);
    if (success) {
      if (this.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
 