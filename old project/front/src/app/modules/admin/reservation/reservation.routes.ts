import { Routes } from '@angular/router';
import { ReservationListComponent } from './list/list.component';
import { ReservationDetailComponent } from './detail/detail.component';

export default [
    {
        path: '',
        component: ReservationListComponent
    },
    {
        path: ':id',
        component: ReservationDetailComponent
    }
] as Routes;

