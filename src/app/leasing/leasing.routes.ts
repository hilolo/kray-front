import { Routes } from '@angular/router';
import { LeasingListComponent } from './list/leasing-list.component';
import { EditLeasingComponent } from './edit/edit-leasing.component';

export const leasingRoutes: Routes = [
  {
    path: '',
    component: LeasingListComponent,
  },
  {
    path: 'add',
    component: EditLeasingComponent,
  },
  {
    path: ':id/edit',
    component: EditLeasingComponent,
  },
];

