import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-company-restricted-dialog',
    templateUrl: './company-restricted-dialog.component.html',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        TranslocoPipe
    ]
})
export class CompanyRestrictedDialogComponent
{
    constructor(
        private _dialogRef: MatDialogRef<CompanyRestrictedDialogComponent>,
        private _authService: AuthService,
        private _router: Router
    )
    {
        // Prevent closing the dialog by clicking outside or pressing escape
        this._dialogRef.disableClose = true;
    }

    /**
     * Disconnect/Logout user
     */
    disconnect(): void
    {
        this._authService.signOut().subscribe(() => {
            this._dialogRef.close();
            this._router.navigate(['/sign-in']);
        });
    }
}
