import { Routes } from '@angular/router';
import { ContactListComponent } from './list/contact-list.component';
import { EditContactComponent } from './edit/edit-contact.component';

export const contactRoutes: Routes = [
  {
    path: 'tenants',
    component: ContactListComponent,
  },
  {
    path: 'tenants/add',
    component: EditContactComponent,
  },
  {
    path: 'owners',
    component: ContactListComponent,
  },
  {
    path: 'owners/add',
    component: EditContactComponent,
  },
  {
    path: 'services',
    component: ContactListComponent,
  },
  {
    path: 'services/add',
    component: EditContactComponent,
  },
  {
    path: '',
    redirectTo: 'tenants',
    pathMatch: 'full',
  },
];

