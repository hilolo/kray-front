import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { propertyRoutes } from './property.routes';

@NgModule({
  imports: [RouterModule.forChild(propertyRoutes)],
  exports: [RouterModule],
})
export class PropertyModule {}

