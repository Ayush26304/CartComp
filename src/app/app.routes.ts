import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { UserHome } from './user/pages/home/user-home/user-home';
import { AdminComponent } from './admin/pages/dashboard/admin-dashboard/admin-dashboard';
//import { NavbarComponent } from './shared/components/navbar/navbar';
import { CategoriesComponent } from './user/pages/categories/categories';
import { ProductDescriptionComponent } from './user/product/product';
import { CartComponent } from './user/cart/cart';
import { UserProfileComponent } from './user/userprofile/userprofile';
import { CheckoutComponent } from './user/checkout/checkout';
import { OrderTrackingComponent } from './user/order-tracking/order-tracking';
import { SearchResultsComponent } from './user/search-results/search-results';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';


 
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'home', 
    component: UserHome,
    canActivate: [AuthGuard],
    children: [
      { path: 'categories', component: CategoriesComponent },
      { path: 'product/:id', component: ProductDescriptionComponent },
      { path: 'cart', component: CartComponent },
      { path: 'userprofile', component: UserProfileComponent },
      { path: 'checkout', component: CheckoutComponent }
    ]
  },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  // Standalone routes (with navbar) - Protected
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'product/:id', component: ProductDescriptionComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'userprofile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'order-tracking/:id', component: OrderTrackingComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchResultsComponent, canActivate: [AuthGuard] }
];
 