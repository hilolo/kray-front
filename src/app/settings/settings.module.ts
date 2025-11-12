import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { settingsRoutes } from './settings.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SettingsComponent,
    RouterModule.forChild(settingsRoutes),
  ],
  exports: [SettingsComponent],
})
export class SettingsModule {}

