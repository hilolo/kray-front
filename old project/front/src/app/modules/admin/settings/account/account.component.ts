import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../core/user/user.service';
import { User } from '../../../../core/user/user.types';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [CommonModule, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, TextFieldModule, MatSelectModule, MatOptionModule, MatButtonModule],
})
export class SettingsAccountComponent implements OnInit, OnDestroy
{
    userForm: UntypedFormGroup;
    companyInfo: any = {};
    isSaving: boolean = false;
    isAvatarUploading: boolean = false;
    formFieldHelpers: string[] = [''];
    private originalData: any = {}; // Store original form data to detect changes
    private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
    private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _http: HttpClient,
        private _userService: UserService,
        private _errorHandlerService: ErrorHandlerService,
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
        // Create the user form (editable fields)
        this.userForm = this._formBuilder.group({
            name    : ['', [Validators.required, Validators.maxLength(200)]],
            phone   : [''],
            avatar  : ['']
        });

        // Subscribe to user data from UserService
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                if (user) {
                    this.populateFormWithUserData(user);
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Populate form with user data from UserService
     */
    populateFormWithUserData(user: User): void {
        // Store original data for change detection
        this.originalData = {
            name: user.name || '',
            phone: (user as any).phone || '', // Phone might not be in the User interface
            avatar: user.avatar || ''
        };
        
        // Populate user form with user data
        this.userForm.patchValue({
            name: this.originalData.name,
            phone: this.originalData.phone,
            avatar: this.originalData.avatar
        });

        // Set company information from user data
        if (user.company) {
            this.companyInfo = {
                id: user.company.id,
                name: user.company.name,
                address: user.company.address,
                city: user.company.city,
                phone: user.company.phone,
                website: user.company.website,
                rc: user.company.rc,
                ice: user.company.ice,
                image: user.company.image
            };
        }
    }

    /**
     * Get avatar source for display
     */
    getAvatarSrc(): string {
        const avatarValue = this.userForm.get('avatar')?.value;
        if (avatarValue) {
            // If it's base64 data, add the data URL prefix
            if (avatarValue.startsWith('data:')) {
                return avatarValue;
            } else if (avatarValue.startsWith('http')) {
                return avatarValue;
            } else {
                // If it's just base64 data without prefix, add the prefix
                return `data:image/jpeg;base64,${avatarValue}`;
            }
        }
        return 'assets/images/avatars/avatar.webp';
    }

    /**
     * Check if the form has any changes
     */
    hasFormChanges(): boolean {
        if (!this.userForm) return false;
        
        const formData = this.userForm.value;
        
        // Check if any field has changed
        const nameChanged = (formData.name || '') !== (this.originalData.name || '');
        const phoneChanged = (formData.phone || '') !== (this.originalData.phone || '');
        const avatarChanged = (formData.avatar || '') !== (this.originalData.avatar || '');
        
        return nameChanged || phoneChanged || avatarChanged;
    }

    /**
     * Handle avatar click
     */
    onAvatarClick(): void
    {
        const avatarInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (avatarInput) {
            avatarInput.click();
        }
    }

    /**
     * Handle avatar change
     */
    onAvatarChange(event: any): void
    {
        const file = event.target.files[0];
        
        if (file) {
            // Show loading state first
            this.isAvatarUploading = true;
            this._cdr.detectChanges();

            // Validate file type
            if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
                this.isAvatarUploading = false;
                this._cdr.detectChanges();
                this._errorHandlerService.showErrorAlert('Invalid File Type', 'Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size
            if (file.size > this.MAX_FILE_SIZE) {
                this.isAvatarUploading = false;
                this._cdr.detectChanges();
                this._errorHandlerService.showErrorAlert('File Too Large', 'Image size must not exceed 1MB');
                return;
            }

            // Add minimum file size validation
            const MIN_FILE_SIZE = 1024; // 1KB minimum
            if (file.size < MIN_FILE_SIZE) {
                this.isAvatarUploading = false;
                this._cdr.detectChanges();
                this._errorHandlerService.showErrorAlert('File Too Small', 'Image file is too small. Please select a larger image.');
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e: any) => {
                // Extract base64 data (remove data:image/...;base64, prefix)
                const base64Data = e.target.result.split(',')[1];
                
                this.userForm.patchValue({
                    avatar: base64Data
                });
                
                // Hide loading state immediately after processing
                this.isAvatarUploading = false;
                this._cdr.detectChanges();
            };
            
            reader.onerror = (error) => {
                this.isAvatarUploading = false;
                this._cdr.detectChanges();
                this._errorHandlerService.showErrorAlert('Upload Error', 'Failed to process the image file');
            };
            
            reader.readAsDataURL(file);
        }
    }

    /**
     * Reset user form
     */
    resetUserForm(): void
    {
        // Get current user data from UserService and reset form
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {
            if (user) {
                this.populateFormWithUserData(user);
            }
        });
    }

    /**
     * Save user information
     */
    saveUserInfo(): void
    {
        if (this.userForm.valid && !this.isSaving) {
            this.isSaving = true;
            const formData = this.userForm.value;
            
            // Prepare the update data - only include fields that have changed
            const updateData: any = {};
            
            // Check each field and only include if changed
            if ((formData.name || '') !== (this.originalData.name || '')) {
                updateData.name = formData.name;
            }
            
            if ((formData.phone || '') !== (this.originalData.phone || '')) {
                updateData.phone = formData.phone;
            }
            
            if ((formData.avatar || '') !== (this.originalData.avatar || '')) {
                updateData.avatar = formData.avatar;
            }
            
            // If no fields have changed, show message and return
            if (Object.keys(updateData).length === 0) {
                this.isSaving = false;
                this._errorHandlerService.showInfoAlert('No Changes', 'No changes detected to save');
                return;
            }

            // Call the API to update user profile
            this._http.put(`${environment.apiUrl}/api/user/me`, updateData).subscribe({
                next: (response: any) => {
                    this.isSaving = false;
                    this._errorHandlerService.showSuccessAlert('Success!', 'Profile updated successfully!');
                    
                    // Update the original data for all changed fields
                    if (updateData.name !== undefined) {
                        this.originalData.name = updateData.name;
                    }
                    if (updateData.phone !== undefined) {
                        this.originalData.phone = updateData.phone;
                    }
                    if (updateData.avatar !== undefined) {
                        this.originalData.avatar = updateData.avatar;
                    }
                    
                    // Update the user data in UserService while preserving company information
                    if (response && response.data) {
                        // Get current user data to preserve company information
                        this._userService.user$.pipe(take(1), takeUntil(this._unsubscribeAll)).subscribe((currentUser: User) => {
                            if (currentUser) {
                                // Merge the response data with existing company data
                                const updatedUser: User = {
                                    ...response.data,
                                    company: response.data.company || currentUser.company // Preserve company if not in response
                                };
                                this._userService.user = updatedUser;
                                
                                // If company data is still missing, refresh user data from API
                                if (!updatedUser.company) {
                                    this._userService.get().subscribe((refreshedUser: User) => {
                                        // User data refreshed
                                    });
                                }
                            } else {
                                // If no current user data, use response as is
                                this._userService.user = response.data;
                            }
                        });
                    }
                },
                error: (error) => {
                    this.isSaving = false;
                    console.error('Error updating profile:', error);
                    this._errorHandlerService.showErrorAlert('Update Failed', 'Failed to update profile. Please try again.');
                }
            });
        } else if (!this.userForm.valid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields correctly');
        }
    }

}
