import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../../shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesComponent } from '../../categories/categories';
import { RouterOutlet } from '@angular/router';

 
@Component({
  selector: 'app-home',
  templateUrl: './user-home.html',
  imports:[NavbarComponent, FooterComponent, CommonModule, FormsModule, CategoriesComponent, RouterOutlet],
  styleUrl:'./user-home.scss'
})
export class UserHome {
  constructor(private router: Router) {}

  navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }
}