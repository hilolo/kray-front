import { Routes } from '@angular/router';
import { BuildingListComponent } from './list/building-list.component';
import { EditBuildingComponent } from './edit/edit-building.component';

export const buildingRoutes: Routes = [
  {
    path: '',
    component: BuildingListComponent,
  },
  {
    path: 'add',
    component: EditBuildingComponent,
  },
  {
    path: ':id',
    component: EditBuildingComponent,
  },
];

