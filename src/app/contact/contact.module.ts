import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactListComponent } from './list/contact-list.component';
import { contactRoutes } from './contact.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContactListComponent,
    RouterModule.forChild(contactRoutes),
  ],
  exports: [ContactListComponent],
})
export class ContactModule {}

