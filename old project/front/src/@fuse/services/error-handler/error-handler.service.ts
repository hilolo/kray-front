import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FuseAlertService } from '@fuse/components/alert/alert.service';
import { AlertContainerComponent, AlertData } from 'app/layout/common/alert-container/alert-container.component';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService
{
    private _alertContainer: AlertContainerComponent | null = null;

    constructor(
        private _fuseAlertService: FuseAlertService,
        private _injector: Injector
    ) {}

    /**
     * Handle HTTP error and show appropriate alert
     */
    handleError(error: HttpErrorResponse): void
    {
        let errorMessage = 'An unexpected error occurred';
        let errorTitle = 'Error';

        if (error.error instanceof ErrorEvent)
        {
            // Client-side error
            errorMessage = error.error.message;
            errorTitle = 'Client Error';
        }
        else
        {
            // Server-side error
            switch (error.status)
            {
                case 400:
                    errorTitle = 'Bad Request';
                    // Extract the actual error message from the backend response
                    if (error.error?.message) {
                        errorMessage = error.error.message;
                    } else {
                        errorMessage = 'The request was invalid';
                    }
                    break;
                case 401:
                    errorTitle = 'Unauthorized';
                    errorMessage = error.error?.message || 'You are not authorized to perform this action';
                    break;
                case 403:
                    errorTitle = 'Forbidden';
                    errorMessage = error.error?.message || 'Access to this resource is forbidden';
                    break;
                case 404:
                    errorTitle = 'Not Found';
                    errorMessage = error.error?.message || 'The requested resource was not found';
                    break;
                case 422:
                    errorTitle = 'Validation Error';
                    errorMessage = error.error?.message || 'The data provided is invalid';
                    break;
                case 500:
                    errorTitle = 'Server Error';
                    errorMessage = error.error?.message || 'An internal server error occurred';
                    break;
                case 502:
                    errorTitle = 'Bad Gateway';
                    errorMessage = 'The server is temporarily unavailable';
                    break;
                case 503:
                    errorTitle = 'Service Unavailable';
                    errorMessage = 'The service is temporarily unavailable';
                    break;
                default:
                    errorTitle = 'Error';
                    errorMessage = error.error?.message || `An error occurred (${error.status})`;
            }
        }

        // Show error alert
        this.showErrorAlert(errorTitle, errorMessage);
    }

    /**
     * Show success alert
     */
    showSuccessAlert(title: string, message: string): void
    {
        this.showAlert('success', title, message);
    }

    /**
     * Show warning alert
     */
    showWarningAlert(title: string, message: string): void
    {
        this.showAlert('warning', title, message);
    }

    /**
     * Show info alert
     */
    showInfoAlert(title: string, message: string): void
    {
        this.showAlert('info', title, message);
    }

    /**
     * Show error alert
     */
    showErrorAlert(title: string, message: string, persistent: boolean = false): void
    {
        this.showAlert('error', title, message, persistent);
    }

    /**
     * Show persistent error alert (doesn't auto-dismiss)
     */
    showPersistentErrorAlert(title: string, message: string): void
    {
        this.showAlert('error', title, message, true);
    }

    /**
     * Set the alert container reference
     */
    setAlertContainer(container: AlertContainerComponent): void
    {
        this._alertContainer = container;
    }

    /**
     * Show alert with specified type
     */
    private showAlert(type: 'success' | 'warning' | 'info' | 'error', title: string, message: string, persistent: boolean = false): void
    {
        if (!this._alertContainer) {
            console.warn('Alert container not available');
            return;
        }

        const alertData: AlertData = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            message,
            dismissible: true,
            autoDismiss: !persistent,
            dismissTime: persistent ? undefined : 3000 // 3 seconds for non-persistent alerts
        };

        this._alertContainer.addAlert(alertData);
    }
}
