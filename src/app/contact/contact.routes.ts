import { Routes } from '@angular/router';
import { ContactListComponent } from './list/contact-list.component';
import { EditContactComponent } from './edit/edit-contact.component';
import { ContactDetailComponent } from './detail/contact-detail.component';

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
    path: 'tenants/:id/detail',
    component: ContactDetailComponent,
  },
  {
    path: 'tenants/:id',
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
    path: 'owners/:id/detail',
    component: ContactDetailComponent,
  },
  {
    path: 'owners/:id',
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
    path: 'services/:id/detail',
    component: ContactDetailComponent,
  },
  {
    path: 'services/:id',
    component: EditContactComponent,
  },
  {
    path: '',
    redirectTo: 'tenants',
    pathMatch: 'full',
  },
];

