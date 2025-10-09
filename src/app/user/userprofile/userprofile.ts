
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

 
@Component({
   selector: 'app-userprofile',
  imports: [UpperCasePipe,FormsModule,CommonModule],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.scss'
})
export class UserProfile implements OnInit {
  user = {
    name: 'Rishu Kumar',
    email: 'rishu@example.com',
    image: 'https://i.pravatar.cc/150?img=12'
  };
 
  tabs = ['Orders', 'Favorites', 'Addresses'];
  activeTab = 'Orders';
 
  orders = [
    {
      id: 'A1234',
      date: new Date('2025-09-20'),
      status: 'Delivered',
      items: [
        {
          title: 'Noise Smartwatch',
          image: 'https://m.media-amazon.com/images/I/71fVoqRC0wL._AC_UY327_FMwebp_QL65_.jpg',
          price: 3499
        },
        {
          title: 'boAt Rockerz 550 Headphones',
          image: 'https://m.media-amazon.com/images/I/71IS7-HhcUL._AC_UY327_FMwebp_QL65_.jpg',
          price: 1999
        }
      ]
    },
    {
      id: 'A5678',
      date: new Date('2025-10-05'),
      status: 'Shipped',
      items: [
        {
          title: 'Mi Powerbank 20000mAh',
          image: 'https://m.media-amazon.com/images/I/61kWB+uzR2L._AC_UY327_FMwebp_QL65_.jpg',
          price: 1799
        }
      ]
    }
  ];
 
  favorites = [
    {
      title: 'Samsung Galaxy M14',
      image: 'https://m.media-amazon.com/images/I/81ZSn2rk9WL._AC_UY327_FMwebp_QL65_.jpg',
      price: 12499
    },
    {
      title: 'Apple AirPods Pro',
      image: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_UY327_FMwebp_QL65_.jpg',
      price: 24999
    }
  ];
 
  addresses = [
    {
      name: 'Home',
      line1: 'Flat No 23, Green Valley Apartments',
      city: 'Pune',
      state: 'Maharashtra',
      zip: '411045',
      phone: '+91 9876543210'
    }
  ];
 
  ngOnInit(): void {}
 
  selectTab(tab: string): void {
    this.activeTab = tab;
  }
 
  editProfile(): void {
    alert('Edit profile feature coming soon!');
  }
}
 