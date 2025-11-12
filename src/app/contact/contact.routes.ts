import { Routes } from '@angular/router';
import { ContactListComponent } from './list/contact-list.component';

export const contactRoutes: Routes = [
  {
    path: 'list',
    component: ContactListComponent,
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];

