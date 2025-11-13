import { Routes } from '@angular/router';
import { KeysComponent } from 'app/modules/admin/keys/keys.component';
import { KeysListComponent } from 'app/modules/admin/keys/list/list.component';

export default [
    {
        path: '',
        component: KeysComponent,
        children: [
            {
                path: '',
                component: KeysListComponent,
            },
        ],
    },
] as Routes;

