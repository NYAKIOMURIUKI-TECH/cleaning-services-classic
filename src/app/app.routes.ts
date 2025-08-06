// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Client } from './dashboard/client/client';
import { Cleaner } from './dashboard/cleaner/cleaner';
import { Admin } from './dashboard/admin/admin';    

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'client', component: Client },
  {path: 'cleaner', component: Cleaner },
  {path: 'admin', component: Admin },
//   {
//     path: 'client',
//     loadChildren: () =>
//       import('./dashboard/client/client.routes').then((m) => m.CLIENT_ROUTES),
//   },
//   {
//     path: 'cleaner',
//     loadChildren: () =>
//       import('./dashboard/cleaner/cleaner.routes').then((m) => m.CLEANER_ROUTES),
//   },
//   {
//     path: 'admin',
//     loadChildren: () =>
//       import('./dashboard/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
//   },
];
