// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../auth/auth.service';
 
// @Component({
//   selector: 'app-navbar',
//   templateUrl: './navbar.html',
//   styleUrls: ['./navbar.scss']
// })
// export class NavbarComponent {
//   isLoggedIn = false;
//   username: string = '';
 
//   constructor(private authService: AuthService, private router: Router) {
//     this.isLoggedIn = this.authService.isLoggedIn$();
//     const user = this.authService.getLoggedInUser();
//     this.username = user ? user.username : '';
//   }
 
//   logout() {
//     this.authService.logout();
//     this.isLoggedIn = false;
//     this.router.navigate(['/login']);
//   }
// }


import { Component, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  isMenuOpen:boolean = false;
  isLoggedIn = false;
  userRole: string | null = null;
  username = signal<string|null>("sdjhgfjhsg");
  constructor(private authService: AuthService) {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
    this.authService.user$.subscribe(user => {
      this.username.set(user);
    });
  }

  logout() {
    this.authService.logout();
  }
}