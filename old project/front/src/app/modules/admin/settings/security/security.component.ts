import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { timeout, finalize } from 'rxjs/operators';
import { NgClass, NgIf } from '@angular/common';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule, MatButtonModule, NgClass, NgIf],
})
export class SettingsSecurityComponent implements OnInit
{
    securityForm: UntypedFormGroup;
    isChangingPassword: boolean = false;
    formFieldHelpers: string[] = [''];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _httpClient: HttpClient,
        private _errorHandlerService: ErrorHandlerService,
        private _cdr: ChangeDetectorRef,
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
        // Create the form
        this.securityForm = this._formBuilder.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Change password
     */
    changePassword(): void
    {
        if (this.securityForm.invalid) {
            return;
        }

        this.isChangingPassword = true;

        const formData = this.securityForm.value;
        const updatePasswordDto = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.newPassword
        };

        this._httpClient.patch(`${environment.apiUrl}/api/user/updatePassword`, updatePasswordDto)
            .pipe(
                timeout(30000), // 30 second timeout
                finalize(() => {
                    // Always reset loading state, regardless of success or error
                    this.isChangingPassword = false;
                    // Force change detection since we're using OnPush
                    this._cdr.detectChanges();
                })
            )
            .subscribe({
                next: (response) => {
                    this._errorHandlerService.showSuccessAlert('Success!', 'Password changed successfully!');
                    this.resetForm();
                },
                error: (error) => {
                    console.error('Password change error callback executed:', error);
                    // Error handling is done by the HTTP interceptor
                    // No need to show another alert here
                }
            });
    }

    /**
     * Reset form
     */
    resetForm(): void
    {
        this.securityForm.reset();
    }

    /**
     * Cancel password change operation
     */
    cancelPasswordChange(): void
    {
        if (this.isChangingPassword) {
            // If currently changing password, just reset the loading state
            this.isChangingPassword = false;
            this._cdr.detectChanges();
        } else {
            // Otherwise, reset the form
            this.resetForm();
        }
    }
}
