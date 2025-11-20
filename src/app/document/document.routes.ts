import { Routes } from '@angular/router';
import { DocumentListComponent } from './list/document-list.component';
import { DocumentEditComponent } from './edit/document-edit.component';

export const documentRoutes: Routes = [
  {
    path: '',
    component: DocumentListComponent,
  },
  {
    path: 'add',
    component: DocumentEditComponent,
  },
  {
    path: ':id',
    component: DocumentEditComponent,
  },
];

