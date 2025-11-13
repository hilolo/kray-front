import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/dashboard'
    {path: '', pathMatch : 'full', redirectTo: 'dashboard'},

    // Public property landing (no auth required)
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {
                path: ':lang/property/:id/public',
                loadComponent: () => import('app/modules/public/property/public-property.component').then(m => m.PublicPropertyComponent)
            },
            {
                path: 'property/:id/public',
                loadComponent: () => import('app/modules/public/property/public-property.component').then(m => m.PublicPropertyComponent)
            }
        ]
    },

    // Redirect signed-in user to the '/dashboard'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboard'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {
                path: 'home', 
                loadChildren: () => import('app/modules/landing/home/home.routes'),
                data: { breadcrumb: { label: 'Home', icon: 'heroicons_outline:home' } }
            },
            {
                path: 'dashboard', 
                loadChildren: () => import('app/modules/landing/home/home.routes'),
                data: { breadcrumb: { label: 'Dashboard', icon: 'heroicons_outline:chart-bar' } }
            },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {
                path: 'settings', 
                loadComponent: () => import('app/modules/admin/settings/settings.component').then(m => m.SettingsComponent),
                data: { breadcrumb: { label: 'Settings', icon: 'heroicons_outline:cog-6-tooth' } }
            },
            {
                path: 'contacts', 
                data: { breadcrumb: { label: 'Contacts', icon: 'heroicons_outline:user-group' } },
                children: [
                    {
                        path: '', 
                        pathMatch: 'full', 
                        redirectTo: 'tenants'
                    },
                    {
                        path: 'tenants', 
                        loadChildren: () => import('app/modules/admin/contacts/tenants.routes'),
                        data: { breadcrumb: 'Tenants' }
                    },
                    {
                        path: 'owners', 
                        loadChildren: () => import('app/modules/admin/contacts/owners.routes'),
                        data: { breadcrumb: 'Owners' }
                    },
                    {
                        path: 'service-pros', 
                        loadChildren: () => import('app/modules/admin/contacts/services.routes'),
                        data: { breadcrumb: 'Service Providers' }
                    },
                ]
            },
            {
                path: 'property', 
                loadChildren: () => import('app/modules/admin/property/property.routes'),
                data: { breadcrumb: { label: 'Properties', icon: 'heroicons_outline:building-office-2' } }
            },
            {
                path: 'building', 
                loadChildren: () => import('app/modules/admin/building/building.routes'),
                data: { breadcrumb: { label: 'Buildings', icon: 'heroicons_outline:building-office' } }
            },
            {
                path: 'keys', 
                loadChildren: () => import('app/modules/admin/keys/keys.routes'),
                data: { breadcrumb: { label: 'Keys', icon: 'heroicons_outline:key' } }
            },
            {
                path: 'leasing', 
                loadChildren: () => import('app/modules/admin/leasing/leasing.routes'),
                data: { breadcrumb: { label: 'Leasing', icon: 'heroicons_outline:document-text' } }
            },
            {
                path: 'maintenance', 
                loadChildren: () => import('app/modules/admin/maintenance/maintenance.routes'),
                data: { breadcrumb: { label: 'Maintenance', icon: 'heroicons_outline:wrench-screwdriver' } }
            },
            {
                path: 'tasks',
                loadChildren: () => import('app/modules/admin/tasks/tasks.routes'),
                data: { breadcrumb: { label: 'Tasks', icon: 'heroicons_outline:clipboard-document-check' } }
            },
            {
                path: 'reservation', 
                loadChildren: () => import('app/modules/admin/reservation/reservation.routes'),
                data: { breadcrumb: { label: 'Reservations', icon: 'heroicons_outline:calendar' } }
            },
            {
                path: 'banks', 
                loadChildren: () => import('app/modules/admin/banks/banks.routes'),
                data: { breadcrumb: { label: 'Bank Accounts', icon: 'heroicons_outline:building-library' } }
            },
            {
                path: 'payments', 
                loadChildren: () => import('app/modules/admin/payments/payments.routes'),
                data: { breadcrumb: { label: 'Payments', icon: 'heroicons_outline:currency-dollar' } }
            },
            {
                path: 'gestionnaire-fichiers', 
                loadChildren: () => import('app/modules/admin/file-manager/file-manager.routes'),
                data: { breadcrumb: { label: 'Gestionnaire de Fichiers', icon: 'heroicons_outline:folder' } }
            },
            {
                path: 'documents/file-manager',
                redirectTo: 'gestionnaire-fichiers',
                pathMatch: 'prefix'
            }
        ]
    },

    // Wildcard route for 404 handling
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
