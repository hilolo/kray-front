import { Routes } from '@angular/router';

export const propertyRequestRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/property-request-list.component').then((m) => m.PropertyRequestListComponent),
  },
];

