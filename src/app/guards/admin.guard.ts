import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      console.log('AdminGuard: User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user has admin role (handle various formats)
    const userRole = this.authService.role?.toUpperCase();
    const allowedRoles = ['ADMIN', 'ROLE_ADMIN'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log('AdminGuard: User does not have admin role:', userRole);
      alert('Access Denied: Admin privileges required');
      this.router.navigate(['/home']);
      return false;
    }

    console.log('AdminGuard: Access granted to admin user with role:', userRole);
    return true;
  }
}
