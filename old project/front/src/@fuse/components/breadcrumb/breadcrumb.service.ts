import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { FuseBreadcrumb } from './breadcrumb.types';

@Injectable({
    providedIn: 'root'
})
export class FuseBreadcrumbService {
    private _breadcrumbs: BehaviorSubject<FuseBreadcrumb[]> = new BehaviorSubject<FuseBreadcrumb[]>([]);

    /**
     * Constructor
     */
    constructor(private _router: Router) {
        // Build initial breadcrumbs if router state is available
        setTimeout(() => {
            const initialBreadcrumbs = this._buildBreadcrumbs(this._router.routerState.snapshot.root);
            if (initialBreadcrumbs.length > 0) {
                this._breadcrumbs.next(initialBreadcrumbs);
            }
        });

        // Subscribe to navigation end events
        this._router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                const breadcrumbs = this._buildBreadcrumbs(this._router.routerState.snapshot.root);
                this._breadcrumbs.next(breadcrumbs);
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for breadcrumbs
     */
    get breadcrumbs$() {
        return this._breadcrumbs.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Build breadcrumbs from route snapshot
     */
    private _buildBreadcrumbs(
        route: ActivatedRouteSnapshot,
        url: string = '',
        breadcrumbs: FuseBreadcrumb[] = []
    ): FuseBreadcrumb[] {
        // Get the child routes
        const children = route.children;

        // Return if there are no more children
        if (children.length === 0) {
            return breadcrumbs;
        }

        // Iterate over each child
        for (const child of children) {
            // Verify primary route
            if (child.outlet !== 'primary') {
                continue;
            }

            // Skip routes without a path
            if (!child.routeConfig || !child.routeConfig.path) {
                return this._buildBreadcrumbs(child, url, breadcrumbs);
            }

            // Build the route URL
            const routeURL = child.url.map(segment => segment.path).join('/');

            // Append route URL to URL
            url += `/${routeURL}`;

            // Get breadcrumb data from route data
            const breadcrumbData = child.data['breadcrumb'];

            if (breadcrumbData) {
                const breadcrumb: FuseBreadcrumb = {
                    label: typeof breadcrumbData === 'string' ? breadcrumbData : breadcrumbData.label || this._formatLabel(routeURL),
                    url: url,
                    icon: breadcrumbData.icon || null
                };

                breadcrumbs.push(breadcrumb);
            } else if (routeURL) {
                // If no breadcrumb data, create one from the path
                const breadcrumb: FuseBreadcrumb = {
                    label: this._formatLabel(routeURL),
                    url: url
                };

                breadcrumbs.push(breadcrumb);
            }

            // Recursive
            return this._buildBreadcrumbs(child, url, breadcrumbs);
        }

        return breadcrumbs;
    }

    /**
     * Format label from URL segment
     */
    private _formatLabel(segment: string): string {
        // Remove hyphens and underscores, capitalize words
        return segment
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Set custom breadcrumbs
     */
    setBreadcrumbs(breadcrumbs: FuseBreadcrumb[]): void {
        this._breadcrumbs.next(breadcrumbs);
    }

    /**
     * Clear breadcrumbs
     */
    clearBreadcrumbs(): void {
        this._breadcrumbs.next([]);
    }
}

