import { Routes } from '@angular/router';
import { ReservationListComponent } from './list/reservation-list.component';
import { EditReservationComponent } from './edit/edit-reservation.component';

export const reservationRoutes: Routes = [
  {
    path: '',
    component: ReservationListComponent,
  },
  {
    path: 'add',
    component: EditReservationComponent,
  },
  {
    path: ':id/edit',
    component: EditReservationComponent,
  },
];

