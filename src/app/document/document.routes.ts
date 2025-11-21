import { Routes } from '@angular/router';
import { DocumentListComponent } from './list/document-list.component';
import { DocumentEditComponent } from './edit/document-edit.component';

export const documentRoutes: Routes = [
  {
    path: '',
    component: DocumentListComponent,
  },
  {
    path: 'add/:type',
    component: DocumentEditComponent,
  },
  {
    path: ':type/:id',
    component: DocumentEditComponent,
  },
];

