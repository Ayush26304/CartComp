import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    } else if (this.authService.isAuthenticated()) {
      // User is logged in but not admin - redirect to user home
      this.router.navigate(['/home']);
      return false;
    } else {
      // User is not logged in - redirect to login
      this.authService.setRedirectUrl(state.url);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
