import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { FileManagerDetailsComponent } from 'app/modules/admin/file-manager/details/details.component';
import { FileManagerComponent } from 'app/modules/admin/file-manager/file-manager.component';
import { FileManagerService } from 'app/modules/admin/file-manager/file-manager.service';
import { FileManagerListComponent } from 'app/modules/admin/file-manager/list/list.component';
import { catchError, throwError } from 'rxjs';

/**
 * Folder resolver
 *
 * @param route
 * @param state
 */
const folderResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);

    // Decode the folderId from URL-encoded format (folderId is still the route param name)
    const encodedFolderId = route.paramMap.get('folderId');
    const root = encodedFolderId ? decodeURIComponent(encodedFolderId) : null;

    return fileManagerService.getItems(root).pipe(
        // Error here means the requested folder is not available
        catchError((error) =>
        {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(error);
        }),
    );
};

/**
 * Item resolver
 *
 * @param route
 * @param state
 */
const itemResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const fileManagerService = inject(FileManagerService);
    const router = inject(Router);

    // Decode the id from URL-encoded format
    const encodedId = route.paramMap.get('id');
    const id = encodedId ? decodeURIComponent(encodedId) : null;

    return fileManagerService.getItemById(id).pipe(
        // Error here means the requested item is not available
        catchError((error) =>
        {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(error);
        }),
    );
};

/**
 * Can deactivate file manager details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateFileManagerDetails = (
    component: FileManagerDetailsComponent,
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

    // If the next state doesn't contain '/gestionnaire-fichiers'
    // it means we are navigating away from the
    // file manager app
    if ( !nextState.url.includes('/gestionnaire-fichiers') )
    {
        // Let it navigate
        return true;
    }

    // If we are navigating to another item...
    if ( nextState.url.includes('/details') )
    {
        // Just navigate
        return true;
    }

    // Otherwise, just navigate (the drawer will close automatically due to route change)
    return true;
};

export default [
    {
        path     : '',
        component: FileManagerComponent,
        children : [
            // Upload routes first (static routes before param routes)
            {
                path     : 'folders/:folderId/details/upload',
                component: FileManagerDetailsComponent,
            },
            {
                path     : 'details/upload',
                component: FileManagerDetailsComponent,
            },
            // Folder routes
            {
                path     : 'folders/:folderId',
                component: FileManagerListComponent,
                resolve  : {
                    items: folderResolver,
                },
                children : [
                    {
                        path         : 'details/:id',
                        component    : FileManagerDetailsComponent,
                        resolve      : {
                            item: itemResolver,
                        },
                        canDeactivate: [canDeactivateFileManagerDetails],
                    },
                ],
            },
            // Root routes
            {
                path     : '',
                component: FileManagerListComponent,
                resolve  : {
                    items: () => inject(FileManagerService).getItems(),
                },
                children : [
                    {
                        path         : 'details/:id',
                        component    : FileManagerDetailsComponent,
                        resolve      : {
                            item: itemResolver,
                        },
                        canDeactivate: [canDeactivateFileManagerDetails],
                    },
                ],
            },
        ],
    },
] as Routes;

