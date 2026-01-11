import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { UserRole } from './models/role.enum';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'carpools',
    loadComponent: () => import('./components/carpool/carpool-list/carpool-list.component').then(m => m.CarpoolListComponent)
  },
  {
    path: 'carpool/:id',
    loadComponent: () => import('./components/carpool/carpool-detail/carpool-detail.component').then(m => m.CarpoolDetailComponent)
  },
  {
    path: 'create-carpool',
    loadComponent: () => import('./components/carpool/create-carpool/create-carpool.component').then(m => m.CreateCarpoolComponent),
    canActivate: [roleGuard([UserRole.Driver])]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard([UserRole.Administrator])]
  },
  {
    path: 'employee',
    loadComponent: () => import('./components/employee/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [roleGuard([UserRole.Employee, UserRole.Administrator])]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
