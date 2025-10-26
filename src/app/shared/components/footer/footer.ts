import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  quickLinks = [
    { name: 'Home', route: '/home' },
    { name: 'Categories', route: '/categories' },
    { name: 'Cart', route: '/cart' },
    { name: 'Profile', route: '/userprofile' }
  ];

  supportLinks = [
    { name: 'Contact Us', route: '#' },
    { name: 'FAQ', route: '#' },
    { name: 'Shipping Info', route: '#' },
    { name: 'Returns', route: '#' }
  ];

  companyLinks = [
    { name: 'About Us', route: '#' },
    { name: 'Careers', route: '#' },
    { name: 'Privacy Policy', route: '#' },
    { name: 'Terms of Service', route: '#' }
  ];

  socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' }
  ];

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
