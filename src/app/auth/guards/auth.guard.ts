import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      // If accessing home route, redirect based on role
      if (state.url === '/home') {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin-dashboard']);
          return false;
        }
        // Regular users can access home
        return true;
      }
      return true;
    } else {
      // Store the attempted URL for redirecting after login
      this.authService.setRedirectUrl(state.url);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
