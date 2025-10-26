import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesComponent } from '../../categories/categories';
import { RouterOutlet } from '@angular/router';

 
@Component({
  selector: 'app-home',
  templateUrl: './user-home.html',
  imports:[NavbarComponent,CommonModule,FormsModule, CategoriesComponent,RouterOutlet],
  styleUrl:'./user-home.scss'
})
export class UserHome {}