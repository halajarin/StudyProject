import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

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
    canActivate: [roleGuard(['Chauffeur'])]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard(['Administrateur'])]
  },
  {
    path: 'employee',
    loadComponent: () => import('./components/employee/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [roleGuard(['Employe', 'Administrateur'])]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
