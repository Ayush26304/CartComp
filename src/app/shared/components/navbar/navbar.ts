

import { Component,signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})

export class NavbarComponent {
  isMenuOpen:boolean = false;
  isLoggedIn = false;
  userRole: string | null = null;
  //username = signal<string|null>("");
  username : string|null = null;
  //cartItemCount = signal(0);

  constructor(private authService: AuthService) {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
    this.authService.user$.subscribe(user => {
    //  this.username.set(user);
      this.username = user;
    });
  }

  logout() {
    this.authService.logout();
  }

  // countCartItems() {
  //   this.cartItemCount.set(this.categoriesService.cartItemsCount());
  // }
}