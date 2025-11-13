import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';
import { CompanyRestrictedDialogComponent } from 'app/shared/components/company-restricted-dialog/company-restricted-dialog.component';
import { filter, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyRestrictionService
{
    private _userService = inject(UserService);
    private _matDialog = inject(MatDialog);
    private _dialogShown = false;

    /**
     * Check if the user's company is restricted
     * If restricted, show the blocking dialog
     */
    checkCompanyRestriction(): void
    {
        // Only check once to avoid multiple dialogs
        if (this._dialogShown) {
            return;
        }

        this._userService.user$
            .pipe(
                filter(user => !!user),
                take(1)
            )
            .subscribe(user => {
                // Check if company exists and is restricted
                if (user.company && user.company.restricted) {
                    this._dialogShown = true;
                    
                    // Show the blocking dialog
                    this._matDialog.open(CompanyRestrictedDialogComponent, {
                        disableClose: true,
                        panelClass: 'company-restricted-dialog',
                        width: '500px'
                    });
                }
            });
    }

    /**
     * Reset the dialog shown flag (for testing purposes)
     */
    reset(): void
    {
        this._dialogShown = false;
    }
}
