import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
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
        loadComponent: () => import('./features/assistant/assistant-page').then(m => m.AssistantPage)
      },
      {
        path: 'help-center', 
        loadComponent: () => import('./features/docs/help-center').then(m => m.HelpCenter)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
