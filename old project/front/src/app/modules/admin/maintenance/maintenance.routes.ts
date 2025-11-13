import { Routes } from '@angular/router';
import { MaintenanceComponent } from 'app/modules/admin/maintenance/maintenance.component';

export default [
    {
        path: '',
        component: MaintenanceComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('app/modules/admin/maintenance/list/list.component').then(m => m.MaintenanceListComponent),
                data: { breadcrumb: 'List' }
            }
        ]
    }
] as Routes;

