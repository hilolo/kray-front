import { Routes } from '@angular/router';
import { PropertyComponent } from 'app/modules/admin/property/property.component';
import { PropertyListComponent } from 'app/modules/admin/property/list/list.component';
import { PropertyWizardComponent } from 'app/modules/admin/property/add/property-wizard.component';
import { PropertyDetailsComponent } from 'app/modules/admin/property/details/details.component';

export default [
    {
        path     : '',
        component: PropertyComponent,
        children : [
            {
                path     : '',
                component: PropertyListComponent,
            },
            {
                path     : 'add',
                component: PropertyWizardComponent,
            },
            {
                path     : ':id/edit',
                component: PropertyWizardComponent,
            },
            {
                path     : ':id',
                component: PropertyDetailsComponent,
            },
        ],
    },
] as Routes;


