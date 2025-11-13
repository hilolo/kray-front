import { Routes } from '@angular/router';
import { BuildingComponent } from 'app/modules/admin/building/building.component';
import { BuildingListComponent } from 'app/modules/admin/building/list/list.component';
import { BuildingDetailComponent } from 'app/modules/admin/building/detail/detail.component';
import { BuildingFullDetailComponent } from 'app/modules/admin/building/full-detail/full-detail.component';

export default [
    {
        path: '',
        component: BuildingComponent,
        children: [
            {
                path: '',
                component: BuildingListComponent,
            },
            {
                path: 'add',
                component: BuildingDetailComponent,
            },
            {
                path: ':id/edit',
                component: BuildingDetailComponent,
            },
            {
                path: ':id',
                component: BuildingFullDetailComponent,
            },
        ],
    },
] as Routes;

