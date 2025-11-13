import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FuseAlertComponent } from '@fuse/components/alert/alert.component';
import { FuseAlertService } from '@fuse/components/alert/alert.service';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

export interface AlertData {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    dismissible?: boolean;
    autoDismiss?: boolean;
    dismissTime?: number;
}

@Component({
    selector: 'alert-container',
    template: `
        <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            <fuse-alert
                *ngFor="let alert of alerts"
                [type]="alert.type"
                [appearance]="'soft'"
                [dismissible]="alert.dismissible !== false"
                [name]="alert.id"
                (dismissedChanged)="onAlertDismissed($event, alert.id)">
                <div fuseAlertTitle>{{ alert.title }}</div>
                <div [innerHTML]="formatMessage(alert.message)"></div>
            </fuse-alert>
        </div>
    `,
    standalone: true,
    imports: [FuseAlertComponent, NgFor]
})
export class AlertContainerComponent implements OnInit, OnDestroy
{
    alerts: AlertData[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseAlertService: FuseAlertService,
        private _errorHandlerService: ErrorHandlerService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void
    {
        // Register this container with the error handler service
        this._errorHandlerService.setAlertContainer(this);

        // Subscribe to alert service events
        this._fuseAlertService.onDismiss
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((alertId: string) => {
                this.removeAlert(alertId);
            });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    addAlert(alert: AlertData): void
    {
        this.alerts.push(alert);
        this._changeDetectorRef.markForCheck();

        // Auto-dismiss if enabled
        if (alert.autoDismiss !== false) {
            const dismissTime = alert.dismissTime || 3000; // Default to 3 seconds
            setTimeout(() => {
                this.removeAlert(alert.id);
            }, dismissTime);
        }
    }

    removeAlert(alertId: string): void
    {
        this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        this._changeDetectorRef.markForCheck();
    }

    onAlertDismissed(dismissed: boolean, alertId: string): void
    {
        if (dismissed) {
            this.removeAlert(alertId);
        }
    }

    formatMessage(message: string): string
    {
        if (!message) {
            return '';
        }
        // Replace \n with <br> for HTML line breaks
        // Also escape HTML to prevent XSS
        return message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }
}
