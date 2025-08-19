import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as Role;
    const user = this.auth.getUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (user.role === requiredRole) {
      return true;
    } else {
      // Redirect to appropriate dashboard
      this.auth['redirectUser'](user.role);
      return false;
    }
  }
}
