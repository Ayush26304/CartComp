import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<string | null>(null);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();
  user$ = this.userSubject.asObservable();
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
      this.userSubject.next('admin');
      return true;
    }
   if (role !== 'user') return false;
   const users = JSON.parse(localStorage.getItem("users") ?? "[]");
   for(let i = 0;i<users.length;i++){
      if(users[i].username === username && users[i].password === password){
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', 'user');
        localStorage.setItem('user', JSON.stringify(users[i]));
        this.isLoggedInSubject.next(true);
        this.userRoleSubject.next('user');
        this.userSubject.next(username);
        return true;
      }
   }
      
 
    return false;
  }
 
  signup(username: string, password: string) {
    if (!this.isBrowser()) return;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({
      username, password
    })
    localStorage.setItem('users', JSON.stringify(users));
  }
 
  logout() {
    if (!this.isBrowser()) return;
    localStorage.setItem("isLoggedIn","false");
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
    this.userSubject.next(null);
  }
 
  get role(): string | null {
    return this.userRoleSubject.value;
  }
 
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
// import { Injectable } from '@angular/core';
 
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private usersKey = 'users';
 
//   constructor() {
//     // Initialize with admin if not present
//     if (!localStorage.getItem(this.usersKey)) {
//       const defaultUsers = [
//         { username: 'admin', password: 'admin123', role: 'admin' }
//       ];
//       localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
//     }
//   }
 
//   private getAllUsers() {
//     const users = localStorage.getItem(this.usersKey);
//     return users ? JSON.parse(users) : [];
//   }
 
//   private saveAllUsers(users: any[]) {
//     localStorage.setItem(this.usersKey, JSON.stringify(users));
//   }
 
//   // ✅ signup
//   signup(username: string, password: string): boolean {
//     const users = this.getAllUsers();
 
//     // check duplicate
//     if (users.find((u: any) => u.username === username)) {
//       return false;
//     }
 
//     users.push({ username, password, role: 'user' }); // default role = user
//     this.saveAllUsers(users);
//     return true;
//   }
 
//   // ✅ login
//   login(username: string, password: string): boolean {
//     const users = this.getAllUsers();
//     const user = users.find(
//       (u: any) => u.username === username && u.password === password
//     );
 
//     if (user) {
//       localStorage.setItem('loggedInUser', JSON.stringify(user));
//       return true;
//     }
//     return false;
//   }
 
//   logout() {
//     localStorage.removeItem('loggedInUser');
//   }
 
//   isLoggedIn(): boolean {
//     return !!localStorage.getItem('loggedInUser');
//   }
 
//   getLoggedInUser() {
//     const user = localStorage.getItem('loggedInUser');
//     return user ? JSON.parse(user) : null;
//   }
// }