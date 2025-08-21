import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userKey = 'currentUser';

  constructor() {}

  // Save logged-in user to localStorage
  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get user from localStorage
  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Clear user data on logout
  logout() {
    localStorage.removeItem(this.userKey);
  }
}
