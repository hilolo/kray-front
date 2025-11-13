import { Routes } from '@angular/router';
import { LeasingComponent } from './leasing.component';
import { LeasingListComponent } from './list/list.component';
import { LeasingDetailComponent } from './detail/detail.component';

export default [
    {
        path: '',
        component: LeasingComponent,
        children: [
            {
                path: '',
                component: LeasingListComponent
            },
            {
                path: 'add',
                component: LeasingDetailComponent
            },
            {
                path: ':id',
                component: LeasingDetailComponent
            }
        ]
    }
] as Routes;

