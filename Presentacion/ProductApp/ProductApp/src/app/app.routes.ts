import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; // Import the AuthGuard

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login-form/login-form.component').then(m => m.LoginFormComponent)
  },
  {
    path: 'secure',
    loadComponent: () => import('./secure/secure.component').then(m => m.SecureComponent),
    canActivate: [AuthGuard] // Apply AuthGuard here
  },
  {
    path: 'product/list',
    loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'product/add',
    loadComponent: () => import('./product-scanner/product-scanner.component').then(m => m.ProductScannerComponent),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'product/register',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'product/edit/:productId',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: 'product/details/:productId',
    loadComponent: () => import('./details-modal/details-modal.component').then(m => m.ProductDetailModalComponent),
    canActivate: [AuthGuard] // Protect this route
  },
  {
    path: '**', // Catch all unmatched routes
    redirectTo: ''
  }
];

