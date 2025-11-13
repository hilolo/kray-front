import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { ContactsComponent } from 'app/modules/admin/contacts/contacts.component';
import { ContactsDetailsComponent } from 'app/modules/admin/contacts/details/details.component';
import { ContactsFullDetailComponent } from 'app/modules/admin/contacts/full-detail/full-detail.component';
import { ContactsListComponent } from 'app/modules/admin/contacts/list/list.component';
import { ContactEditComponent } from 'app/modules/admin/contacts/edit/edit.component';

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
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while ( nextRoute.firstChild )
    {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/contacts'
    // it means we are navigating away from the
    // contacts app
    if ( !nextState.url.includes('/contacts') )
    {
        // Let it navigate
        return true;
    }

    // If we are navigating to another contact...
    if ( nextRoute.paramMap.get('id') )
    {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    const result = component.closeDrawer();
    if (result instanceof Promise) {
        return result.then(() => true);
    }
    return true;
};

export default [
    {
        path     : ':type',
        component: ContactsComponent,
        children : [
            {
                path     : 'add',
                component: ContactEditComponent,
            },
            {
                path     : ':type',
                component: ContactEditComponent,
            },
            {
                path     : '',
                component: ContactsListComponent,
                children : [
                    {
                        path         : ':id',
                        component    : ContactsDetailsComponent,
                        canDeactivate: [canDeactivateContactsDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
