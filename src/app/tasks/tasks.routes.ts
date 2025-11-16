import { Routes } from '@angular/router';
import { TaskListComponent } from './list/task-list.component';
import { EditTaskComponent } from './edit/edit-task.component';

export const tasksRoutes: Routes = [
  {
    path: '',
    component: TaskListComponent,
  },
  {
    path: 'add',
    component: EditTaskComponent,
  },
  {
    path: ':id',
    component: EditTaskComponent,
  },
];

