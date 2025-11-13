import { Routes } from '@angular/router';
import { BanksComponent } from 'app/modules/admin/banks/banks.component';
import { BanksListComponent } from 'app/modules/admin/banks/list/list.component';

export default [
    {
        path: '',
        component: BanksComponent,
        children: [
            {
                path: '',
                component: BanksListComponent,
            },
        ],
    },
] as Routes;

