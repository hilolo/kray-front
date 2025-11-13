import { Routes } from '@angular/router';
import { ContactListComponent } from './list/contact-list.component';
  import { EditContactComponent } from './edit/edit-contact.component';

export const contactRoutes: Routes = [
  {
    path: 'list',
    component: ContactListComponent,
  },
  {
    path: 'add',
    component: EditContactComponent,
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];

