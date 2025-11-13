import { Routes } from '@angular/router';
import { TasksComponent } from './tasks.component';

export default [
    {
        path: '',
        component: TasksComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(m => m.TasksListComponent),
                data: { breadcrumb: 'Tasks' }
            }
        ]
    }
] as Routes;


