import { Routes } from '@angular/router';
import { PropertyListComponent } from './list/property-list.component';
import { EditPropertyComponent } from './edit/edit-property.component';
import { PropertyDetailComponent } from './detail/property-detail.component';

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
    path: 'detail/:id',
    component: PropertyDetailComponent,
  },
  {
    path: ':id',
    component: EditPropertyComponent,
  },
];

