import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { UserHome } from './user/pages/home/user-home/user-home';
import { AdminComponent } from './admin/pages/dashboard/admin-dashboard/admin-dashboard';
//import { NavbarComponent } from './shared/components/navbar/navbar';
import { CategoriesComponent } from './user/pages/categories/categories';
import { ProductDescriptionComponent } from './user/product/product';
import { CartComponent } from './user/cart/cart';
import { Userprofile } from './user/userprofile/userprofile';


 
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: UserHome},
  { path: 'admin', component: AdminComponent },
  //{ path:'navbar',component:NavbarComponent},
  {path:'categories',component:CategoriesComponent},
  {path:'product/:id',component:ProductDescriptionComponent},
  {path:'cart',component:CartComponent},
  {path:'userprofile',component:Userprofile}

];
 