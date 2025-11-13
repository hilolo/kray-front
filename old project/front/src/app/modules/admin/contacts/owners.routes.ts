import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { ContactsComponent } from 'app/modules/admin/contacts/contacts.component';
import { ContactsDetailsComponent } from 'app/modules/admin/contacts/details/details.component';
import { ContactsFullDetailComponent } from 'app/modules/admin/contacts/full-detail/full-detail.component';
import { ContactsListComponent } from 'app/modules/admin/contacts/list/list.component';

/**
 * Can deactivate contacts details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateContactsDetails = (
    component: ContactsDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot) =>
{
    // Allow navigation
    return true;
};

export default [
    {
        path     : '',
        component: ContactsComponent,
        children : [
            {
                path     : '',
                component: ContactsListComponent,
            },
            {
                path         : 'new',
                component    : ContactsDetailsComponent,
                canDeactivate: [canDeactivateContactsDetails],
            },
            {
                path         : ':id/edit',
                component    : ContactsDetailsComponent,
                canDeactivate: [canDeactivateContactsDetails],
            },
            {
                path     : ':id',
                component: ContactsFullDetailComponent,
            },
        ],
    },
] as Routes;
