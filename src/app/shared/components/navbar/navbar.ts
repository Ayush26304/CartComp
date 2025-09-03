import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  isLoggedIn = false;
  userRole: string | null = null;

  constructor(private authService: AuthService) {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  logout() {
    this.authService.logout();
  }
}