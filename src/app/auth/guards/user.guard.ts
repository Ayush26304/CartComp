import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      // If user is admin, they shouldn't access user routes
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin-dashboard']);
        return false;
      }
      // Regular user can access user routes
      return true;
    } else {
      // User is not logged in - redirect to login
      this.authService.setRedirectUrl(state.url);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
