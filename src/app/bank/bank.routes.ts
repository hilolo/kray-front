import { Routes } from '@angular/router';
import { BankListComponent } from './list/bank-list.component';
import { EditBankComponent } from './edit/edit-bank.component';

export const bankRoutes: Routes = [
  {
    path: '',
    component: BankListComponent,
  },
  {
    path: 'add',
    component: EditBankComponent,
  },
  {
    path: ':id',
    component: EditBankComponent,
  },
];

