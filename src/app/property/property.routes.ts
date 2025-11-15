import { Routes } from '@angular/router';
import { PropertyListComponent } from './list/property-list.component';
import { EditPropertyComponent } from './edit/edit-property.component';

export const propertyRoutes: Routes = [
  {
    path: '',
    component: PropertyListComponent,
  },
  {
    path: 'add',
    component: EditPropertyComponent,
  },
  {
    path: ':id',
    component: EditPropertyComponent,
  },
];

