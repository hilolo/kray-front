import { Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';
import { PaymentsListComponent } from './list/list.component';
import { PaymentDetailComponent } from './detail/detail.component';

export default [
    {
        path: '',
        component: PaymentsComponent,
        children: [
            {
                path: '',
                component: PaymentsListComponent
            },
            {
                path: ':type/add',
                component: PaymentDetailComponent
            },
            {
                path: ':type/:id',
                component: PaymentDetailComponent
            }
        ]
    }
] as Routes;


