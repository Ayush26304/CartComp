import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(null);
 
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();
 
  constructor() {
    if (this.isBrowser()) {
      const storedRole = localStorage.getItem('role');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (loggedIn && storedRole) {
        this.isLoggedInSubject.next(true);
        this.userRoleSubject.next(storedRole);
      }
    }
  }
 
  login(username: string, password: string, role: string): boolean {
    if (!this.isBrowser()) return false;
 
    // Hardcoded admin
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', 'admin');
      this.isLoggedInSubject.next(true);
      this.userRoleSubject.next('admin');
      return true;
    }
 
    // Normal user
    if (role === 'user') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', 'user');
      this.isLoggedInSubject.next(true);
      this.userRoleSubject.next('user');
      return true;
    }
 
    return false;
  }
 
  signup(username: string, password: string) {
    if (!this.isBrowser()) return;
    localStorage.setItem('user', JSON.stringify({ username, password }));
  }
 
  logout() {
    if (!this.isBrowser()) return;
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
  }
 
  get role(): string | null {
    return this.userRoleSubject.value;
  }
 
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
 