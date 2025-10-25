import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { UserHome } from './user/pages/home/user-home/user-home';
import { AdminComponent } from './admin/pages/dashboard/admin-dashboard/admin-dashboard';
import { CategoriesComponent } from './user/pages/categories/categories';
import { ProductDescriptionComponent } from './user/product/product';
import { CartComponent } from './user/cart/cart';
import { UserProfileComponent } from './user/userprofile/userprofile';
import { CheckoutComponent } from './user/checkout/checkout';
import { OrderTrackingComponent } from './user/order-tracking/order-tracking';
import { SearchResultsComponent } from './user/search-results/search-results';


 
export const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Admin route
  { path: 'admin-dashboard', component: AdminComponent },
  
  // User routes
  { path: 'home', component: UserHome },
  { path: 'categories', component: CategoriesComponent },
  { path: 'product/:id', component: ProductDescriptionComponent },
  { path: 'cart', component: CartComponent },
  { path: 'userprofile', component: UserProfileComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-tracking/:id', component: OrderTrackingComponent },
  { path: 'search', component: SearchResultsComponent },
  
  // Fallback route
  { path: '**', redirectTo: 'home' }
];
 