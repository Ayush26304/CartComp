import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesComponent } from '../../categories/categories';
 
@Component({
  selector: 'app-home',
  templateUrl: './user-home.html',
  imports:[NavbarComponent,CommonModule,FormsModule, CategoriesComponent],
  styleUrl:'./user-home.scss'
})
export class UserHome {}