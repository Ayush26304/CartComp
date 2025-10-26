

import { Component, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../user/cartservice';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean | null = false;
  userRole: string | null = null;
  username: string | null = null;
  cartItemCount: number = 0;
  searchQuery: string = '';

  constructor(private authService: AuthService, private cartService: CartService, private router: Router) {
    this.authService.token$.subscribe(token => {
      this.isLoggedIn = !!token;
    });

    this.authService.role$.subscribe(role => {
      this.userRole = role;
    });
    this.authService.username$.subscribe(user => {
      this.username = user;
    });

    // Subscribe to cart changes to update count
    this.cartService.cart$.subscribe(items => {
      this.cartItemCount = this.cartService.getTotalQuantity();
    });
  }

  logout() {
    this.authService.logout();
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    }
  }

  // countCartItems() {
  //   this.cartItemCount.set(this.categoriesService.cartItemsCount());
  // }
}