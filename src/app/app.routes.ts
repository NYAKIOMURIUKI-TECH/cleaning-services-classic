import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Client } from './dashboard/client/client';
import { Cleaner } from './dashboard/cleaner/cleaner';
import { Admin } from './dashboard/admin/admin';
import { Booking } from './functionalities/booking/booking';
import { ClientJobs } from './functionalities/client-jobs/client-jobs';
import { Payments } from './functionalities/payments/payments';
import { PaymentCallback } from './functionalities/payments/payment-callback';
import { Rating } from './functionalities/rating/rating';
import { Settings } from './functionalities/settings/settings';
import { PaymentCleaner } from './functionalities/cleaner/payment-cleaner/payment-cleaner';
import { Bookings } from './functionalities/cleaner/bookings/bookings';
import { Ratings } from './functionalities/cleaner/ratings/ratings';
import { AdminUserManagement } from './admin/user-management/user-management';
import { AdminBookingManagement } from './admin/booking-management/booking-management';
import { AdminPaymentManagement } from './admin/payment-management/payment-management';
import { AdminReports } from './admin/reports/reports';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Client Dashboard
  {
    path: 'client',
    component: Client,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },

  // Cleaner Dashboard
  {
    path: 'cleaner',
    component: Cleaner,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'cleaner' }
  },

  // Admin Dashboard
  {
    path: 'admin',
    component: Admin,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },

  // Client routes
  {
    path: 'client/bookings',
    component: Booking,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  {
    path: 'client/jobs',
    component: ClientJobs,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  {
    path: 'client/payments',
    component: Payments,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  {
    path: 'client/payment-callback',
    component: PaymentCallback,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  {
    path: 'client/ratings',
    component: Rating,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },
  {
    path: 'client/settings',
    component: Settings,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'client' }
  },

  // Cleaner routes
  {
    path: 'cleaner/payments',
    component: PaymentCleaner,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'cleaner' }
  },
  {
    path: 'cleaner/bookings',
    component: Bookings,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'cleaner' }
  },
  {
    path: 'cleaner/ratings',
    component: Ratings,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'cleaner' }
  },

  // Admin routes
  {
    path: 'admin/users',
    component: AdminUserManagement,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/bookings',
    component: AdminBookingManagement,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/payments',
    component: AdminPaymentManagement,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/reports',
    component: AdminReports,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  }
];
