import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { HomeComponent } from './user/pages/home/user-home/user-home';
import { AdminComponent } from './admin/pages/dashboard/admin-dashboard/admin-dashboard';
 
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent }
];
 