import { Routes } from '@angular/router';
import { KeysListComponent } from './list/keys-list.component';
import { EditKeyComponent } from './edit/edit-key.component';

export const keysRoutes: Routes = [
  {
    path: '',
    component: KeysListComponent,
  },
  {
    path: 'add',
    component: EditKeyComponent,
  },
  {
    path: ':id',
    component: EditKeyComponent,
  },
];

