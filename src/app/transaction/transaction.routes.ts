import { Routes } from '@angular/router';
import { TransactionListComponent } from './list/transaction-list.component';
import { AddRevenueComponent } from './add/add-revenue.component';
import { AddExpenseComponent } from './add/add-expense.component';

export const transactionRoutes: Routes = [
  {
    path: '',
    component: TransactionListComponent,
  },
  {
    path: 'add/revenue',
    component: AddRevenueComponent,
  },
  {
    path: 'add/expense',
    component: AddExpenseComponent,
  },
  {
    path: 'revenue/:id/edit',
    component: AddRevenueComponent,
  },
  {
    path: 'expense/:id/edit',
    component: AddExpenseComponent,
  },
];

