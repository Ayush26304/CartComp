// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private roleSubject = new BehaviorSubject<string | null>(null);
  private usernameSubject = new BehaviorSubject<string | null>(null);

  token$ = this.tokenSubject.asObservable();
  role$ = this.roleSubject.asObservable();
  username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {
    if (!this.isBrowser()) return;
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
      const claims = this.parseJwt(storedToken);
      const role = claims?.roles?.[0] || null;
      this.roleSubject.next(role);
      this.usernameSubject.next(claims?.sub || null);
    }
  }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('http://localhost:8056/api/auth/login', { username, password }).pipe(
      tap(res => {
        this.tokenSubject.next(res.token);
        const claims = this.parseJwt(res.token);
        const role = claims?.roles?.[0] || null;
        localStorage.setItem("jwt", res.token);
        this.roleSubject.next(role);
        this.usernameSubject.next(claims?.sub || null);
      })
    );
  }

  signup(username: string, password: string): Observable<any> {
    return this.http.post('http://localhost:8056/api/auth/adduser', { username, password });
  }

  logout() {
    this.tokenSubject.next(null);
    this.roleSubject.next(null);
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get role(): string | null {
    return this.roleSubject.value;
  }
  get username(): string | null {
    return this.usernameSubject.value;
  }
  
  get userid(): string | null {
    const token = this.tokenSubject.value;
    if (!token) return null;
    const claims = this.parseJwt(token);
    
    // Return userId from JWT claims (your JWT contains userId: 13)
    if (claims?.userId !== undefined && claims?.userId !== null) {
      return claims.userId.toString();
    }
    
    return null;
  }
  
  get isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  
  getJwtClaims(): any {
    const token = this.tokenSubject.value;
    if (!token) return null;
    return this.parseJwt(token);
  }

  private parseJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}




// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
 
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private isLoggedInSubject = new BehaviorSubject<boolean>(false);
//   private userRoleSubject = new BehaviorSubject<string | null>(null);
//   private userSubject = new BehaviorSubject<string | null>(null);
//   isLoggedIn$ = this.isLoggedInSubject.asObservable();
//   userRole$ = this.userRoleSubject.asObservable();
//   user$ = this.userSubject.asObservable();
//   const baseUrl = "http://localhost:8056/api"
//   constructor( private http:HttpClient) {
//     if (this.isBrowser()) {
//       const storedRole = localStorage.getItem('role');
//       const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
//       if (loggedIn && storedRole) {
//         this.isLoggedInSubject.next(true);
//         this.userRoleSubject.next(storedRole);
//       }
//     }
//   }
 
//   login(username: string, password: string, role: string): boolean {
//     return this.http.get<any>(`${this.baseUrl}/auth/login`, {use});

//     if (!this.isBrowser()) return false;
    
//     // Hardcoded admin
//     if (role === 'admin' && username === 'admin' && password === 'admin123') {
//       localStorage.setItem('isLoggedIn', 'true');
//       localStorage.setItem('role', 'admin');
//       this.isLoggedInSubject.next(true);
//       this.userRoleSubject.next('admin');
//       this.userSubject.next('admin');
//       return true;
//     }
//    if (role !== 'user') return false;
//    const users = JSON.parse(localStorage.getItem("users") ?? "[]");
//    for(let i = 0;i<users.length;i++){
//       if(users[i].username === username && users[i].password === password){
//         localStorage.setItem('isLoggedIn', 'true');
//         localStorage.setItem('role', 'user');
//         localStorage.setItem('user', JSON.stringify(users[i]));
//         this.isLoggedInSubject.next(true);
//         this.userRoleSubject.next('user');
//         this.userSubject.next(username);
//         return true;
//       }
//    }
      
 
//     return false;
//   }
 
//   signup(username: string, password: string) {
//     if (!this.isBrowser()) return;
//     const users = JSON.parse(localStorage.getItem("users") || "[]");
//     users.push({
//       username, password
//     })
//     localStorage.setItem('users', JSON.stringify(users));
//   }
 
//   logout() {
//     if (!this.isBrowser()) return;
//     localStorage.setItem("isLoggedIn","false");
//     this.isLoggedInSubject.next(false);
//     this.userRoleSubject.next(null);
//     this.userSubject.next(null);
//   }
 
//   get role(): string | null {
//     return this.userRoleSubject.value;
//   }
 
//   private isBrowser(): boolean {
//     return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
//   }
// }
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