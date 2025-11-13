import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseBreadcrumbService } from './breadcrumb.service';
import { FuseBreadcrumb } from './breadcrumb.types';

@Component({
    selector: 'fuse-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    exportAs: 'fuseBreadcrumb'
})
export class FuseBreadcrumbComponent implements OnInit, OnDestroy {
    breadcrumbs: FuseBreadcrumb[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _fuseBreadcrumbService: FuseBreadcrumbService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to breadcrumbs
        this._fuseBreadcrumbService.breadcrumbs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((breadcrumbs: FuseBreadcrumb[]) => {
                this.breadcrumbs = breadcrumbs;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.url || index;
    }
}

