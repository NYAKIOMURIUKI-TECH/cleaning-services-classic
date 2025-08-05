// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Customer } from './dashboard/customer/customer';
import { Cleaner } from './dashboard/cleaner/cleaner';
import { Admin } from './dashboard/admin/admin';  
import{Booking} from './functionalities/booking/booking';
import { Payments } from './functionalities/payments/payments';
import { Rating } from './functionalities/rating/rating';
import { Settings } from './functionalities/settings/settings';  

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'customer', component: Customer },
  {path: 'cleaner', component: Cleaner },
  {path: 'admin', component: Admin },
  { path: 'customer/bookings', component: Booking },
  { path: 'customer/payments', component: Payments },
  { path: 'customer/ratings', component: Rating },
  { path: 'customer/settings', component: Settings }


  //   {
  //     path: 'customer',
  //     loadChildren: () =>
  //       import('./dashboard/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  //   },
  //   {
//     path: 'admin',
//     loadChildren: () =>
//       import('./dashboard/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
//   },
];
