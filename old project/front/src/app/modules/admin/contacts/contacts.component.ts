import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { ContactsService } from './contacts.service';
import { ContactType } from './contacts.types';

@Component({
    selector       : 'contacts',
    templateUrl    : './contacts.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [RouterOutlet],
})
export class ContactsComponent implements OnInit, OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isDetailPage: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _contactsService: ContactsService,
        private _cdr: ChangeDetectorRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Determine contact type from URL
        const url = this._router.url;
        
        // Check if we're on a detail page (has an ID in the URL)
        this.isDetailPage = /\/contacts\/(tenants|owners|service-pros|services)\/[^/]+$/.test(url);
        
        let type: ContactType;
        if (url.includes('/contacts/tenants')) {
            type = 'tenant';
        } else if (url.includes('/contacts/owners')) {
            type = 'owner';
        } else if (url.includes('/contacts/service-pros') || url.includes('/contacts/services')) {
            type = 'service';
        }
        
        if (type && ['tenant', 'owner', 'service'].includes(type)) {
            // Set the contact type - the list component will handle loading the data
            this._contactsService.setContactType(type);
        }

        // Listen to route changes to update isDetailPage
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                const currentUrl = this._router.url;
                this.isDetailPage = /\/contacts\/(tenants|owners|service-pros|services)\/[^/]+$/.test(currentUrl);
                this._cdr.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
