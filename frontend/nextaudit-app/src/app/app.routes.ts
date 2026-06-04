import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, roleGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.Login)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password').then(m => m.ResetPassword)
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      { 
        path: 'inventory', 
        loadComponent: () => import('./features/inventory/inventory').then(m => m.Inventory)
      },
      { 
        path: 'history', 
        loadComponent: () => import('./features/history/history').then(m => m.History)
      },
      {
        path: 'assistant',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'super_admin'] },
        loadComponent: () => import('./features/assistant/assistant-page').then(m => m.AssistantPage)
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['super_admin'] },
        loadComponent: () => import('./features/admin-users/admin-users').then(m => m.AdminUsers)
      },
      {
        path: 'help-center', 
        loadComponent: () => import('./features/docs/help-center').then(m => m.HelpCenter)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
