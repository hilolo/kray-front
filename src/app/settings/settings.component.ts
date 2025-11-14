import { Component, computed, effect, ElementRef, inject, signal, TemplateRef, viewChild, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardPageComponent } from '../page/page.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { PermissionsDialogComponent } from '@shared/components/permissions-dialog/permissions-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import type { TeamMember } from '@shared/models/user/team-member.model';
import { ThemeService, type ThemePreset } from '@shared/services/theme.service';

type SettingsSection = 'account' | 'security' | 'plan-billing' | 'team' | 'application';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ZardPageComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAvatarComponent,
    ZardBadgeComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly toastService = inject(ToastService);
  private readonly themeService = inject(ThemeService);
  private readonly destroy$ = new Subject<void>();

  activeSection = signal<SettingsSection>('account');

  // Icon templates for input groups
  userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');
  phoneIconTemplate = viewChild.required<TemplateRef<void>>('phoneIconTemplate');
  buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  building2IconTemplate = viewChild.required<TemplateRef<void>>('building2IconTemplate');
  mapPinIconTemplate = viewChild.required<TemplateRef<void>>('mapPinIconTemplate');
  globeIconTemplate = viewChild.required<TemplateRef<void>>('globeIconTemplate');
  lockIconTemplate = viewChild.required<TemplateRef<void>>('lockIconTemplate');

  // File input reference
  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  // User Information
  userInfo = {
    fullName: signal(''),
    phone: signal(''),
    email: '',
  };

  // Loading state for save operation
  isSaving = signal(false);

  // Form validation state
  formSubmitted = signal(false);

  // Profile image
  profileImageUrl = signal<string | null>(null);
  profileImageFile = signal<File | null>(null);

  // Computed signal to check if account form is valid (all required fields filled)
  readonly isAccountFormValid = computed(() => {
    return this.userInfo.fullName() && this.userInfo.fullName().trim() !== '';
  });

  // Computed signals for error messages
  readonly fullNameError = computed(() => {
    if (!this.formSubmitted()) return '';
    const fullName = this.userInfo.fullName();
    if (!fullName || fullName.trim() === '') {
      return 'Full name is required';
    }
    return '';
  });

  // Computed signal to check if full name input has error
  readonly fullNameHasError = computed(() => {
    return this.formSubmitted() && (!this.userInfo.fullName() || this.userInfo.fullName().trim() === '');
  });

  // Company Information (read-only) - populated from user service
  companyInfo = {
    name: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    rc: '',
    ice: '',
  };

  // Password Form
  passwordForm = {
    currentPassword: signal(''),
    newPassword: signal(''),
    confirmPassword: signal(''),
  };
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  
  // Password form validation state
  passwordFormSubmitted = signal(false);
  
  // Loading state for password update
  isUpdatingPassword = signal(false);

  // Team Members
                                      teamMembers = signal<TeamMember[]>([]);
  isLoadingTeamMembers = signal(false);

  // Application Settings
  appSettings = {
    language: 'fr',
  };

  // Theme settings
  readonly currentTheme = this.themeService.getCurrentThemeSignal();
  readonly themePresets = this.themeService.themePresets;

  onThemeChange(theme: string): void {
    this.themeService.setTheme(theme as ThemePreset);
  }

  // Computed signals for reactive user and company data
  readonly currentUser = computed(() => this.userService.getCurrentUser());
  readonly currentCompany = computed(() => this.userService.company());

  constructor() {
    // Use effect to reactively update user and company info when data changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.userInfo.email = user.email || '';
        this.userInfo.fullName.set(user.name || '');
        this.userInfo.phone.set(user.phone || '');
        
        // Update profile image if avatar exists
        if (user.avatar && !this.profileImageUrl()) {
          this.profileImageUrl.set(user.avatar);
        }
      }
    });

    effect(() => {
      const company = this.currentCompany();
      if (company) {
        this.companyInfo = {
          name: company.name || '',
          address: company.address || '',
          city: company.city || '',
          phone: company.phone || '',
          website: company.website || '',
          rc: company.rc || '',
          ice: company.ice || '',
        };
      }
    });
  }

  ngOnInit(): void {
    // Initial population (effects will handle updates)
    const user = this.currentUser();
    if (user) {
      this.userInfo.email = user.email || '';
      this.userInfo.fullName.set(user.name || '');
      this.userInfo.phone.set(user.phone || '');
      
      // Set profile image if avatar exists
      if (user.avatar) {
        this.profileImageUrl.set(user.avatar);
      }
    }
    
    const company = this.currentCompany();
    if (company) {
      this.companyInfo = {
        name: company.name || '',
        address: company.address || '',
        city: company.city || '',
        phone: company.phone || '',
        website: company.website || '',
        rc: company.rc || '',
        ice: company.ice || '',
      };
    }

    // Load team members
    this.loadTeamMembers();
  }

  /**
   * Load team members from API
   */
  loadTeamMembers(): void {
    this.isLoadingTeamMembers.set(true);
    this.userService.getTeamMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.teamMembers.set(members);
          this.isLoadingTeamMembers.set(false);
        },
        error: (error) => {
          console.error('Error loading team members:', error);
          this.isLoadingTeamMembers.set(false);
          this.toastService.error('Failed to load team members');
        }
      });
  }

  /**
   * Open permissions dialog for a team member
   */
  openPermissionsDialog(member: TeamMember): void {
    const dialogRef = this.dialogService.create({
      zContent: PermissionsDialogComponent,
      zTitle: `Permissions - ${member.name || member.email}`,
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px]',
      zData: { userId: member.id },
      zViewContainerRef: this.viewContainerRef,
      zOkText: 'Save',
      zCancelText: 'Cancel',
      zOnOk: (instance: PermissionsDialogComponent) => {
        // Save permissions
        instance.savePermissions()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              dialogRef.close();
            },
            error: () => {
              // Error is already handled in the component
              // Don't close dialog on error
            }
          });
        return false; // Prevent default close behavior
      },
    });
  }

  // Property Settings
  propertySettings = {
    defaultCity: '',
    locationRef: 'AL',
    saleRef: 'AV',
    vacationRef: 'VC',
  };

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  // Computed signal to check if password form is valid
  readonly isPasswordFormValid = computed(() => {
    const currentPassword = this.passwordForm.currentPassword();
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();
    
    return (
      currentPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      newPassword.length >= 8 &&
      confirmPassword.trim() !== '' &&
      newPassword === confirmPassword
    );
  });

  // Computed signals for error messages
  readonly currentPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const currentPassword = this.passwordForm.currentPassword();
    if (!currentPassword || currentPassword.trim() === '') {
      return 'Current password is required';
    }
    return '';
  });

  readonly newPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const newPassword = this.passwordForm.newPassword();
    if (!newPassword || newPassword.trim() === '') {
      return 'New password is required';
    }
    if (newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  });

  readonly confirmPasswordError = computed(() => {
    if (!this.passwordFormSubmitted()) return '';
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();
    if (!confirmPassword || confirmPassword.trim() === '') {
      return 'Please confirm your password';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  });

  // Computed signals to check if fields have errors (for styling)
  readonly currentPasswordHasError = computed(() => {
    return this.passwordFormSubmitted() && (!this.passwordForm.currentPassword() || this.passwordForm.currentPassword().trim() === '');
  });

  readonly newPasswordHasError = computed(() => {
    if (!this.passwordFormSubmitted()) return false;
    const newPassword = this.passwordForm.newPassword();
    return !newPassword || newPassword.trim() === '' || newPassword.length < 8;
  });

  readonly confirmPasswordHasError = computed(() => {
    if (!this.passwordFormSubmitted()) return false;
    const newPassword = this.passwordForm.newPassword();
    const confirmPassword = this.passwordForm.confirmPassword();
    return !confirmPassword || confirmPassword.trim() === '' || newPassword !== confirmPassword;
  });

  onCancel(): void {
    // Reset forms or navigate away
  }

  onImageClick(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Store the file
      this.profileImageFile.set(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileImageUrl.set(result);
      };
      reader.readAsDataURL(file);
    }

    // Reset the input so the same file can be selected again
    input.value = '';
  }


  onSaveUserInfo(): void {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isAccountFormValid()) {
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    // Prepare user data for update
    const fullName = this.userInfo.fullName();
    const userData: { name?: string; phone?: string; avatar?: string } = {
      name: fullName.trim(),
    };

    // Only include phone if it's provided
    const phone = this.userInfo.phone();
    if (phone && phone.trim() !== '') {
      userData.phone = phone.trim();
    }

    // Handle avatar: convert file to base64 if a new image was selected
    const imageFile = this.profileImageFile();
    if (imageFile) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1] || base64String;
        userData.avatar = base64Data;

        // Call the update service with avatar
        this.updateUserData(userData);
      };
      reader.onerror = () => {
        this.isSaving.set(false);
        this.toastService.error('Failed to read image file');
      };
      reader.readAsDataURL(imageFile);
    } else {
      // No new image selected, update without avatar
      this.updateUserData(userData);
    }
  }

  private updateUserData(userData: { name?: string; phone?: string; avatar?: string }): void {
    // Call the update service
    this.userService.updateUser(userData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedUser) => {
        this.isSaving.set(false);
        this.formSubmitted.set(false); // Reset form validation state on success
        this.toastService.success('Account information updated successfully');
        
        // Clear the file reference after successful update
        this.profileImageFile.set(null);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error updating user info:', error);
        // Toast error is handled automatically by the API interceptor/service
      },
    });
  }

  onSavePassword(): void {
    // Mark form as submitted to show validation errors
    this.passwordFormSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isPasswordFormValid()) {
      return;
    }

    // Set loading state
    this.isUpdatingPassword.set(true);

    // Prepare password data
    const passwordData = {
      currentPassword: this.passwordForm.currentPassword().trim(),
      newPassword: this.passwordForm.newPassword().trim(),
      confirmPassword: this.passwordForm.confirmPassword().trim(),
    };

    // Call the update password service
    this.userService.updatePassword(passwordData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.passwordFormSubmitted.set(false); // Reset form validation state on success
        
        // Reset form fields
        this.passwordForm.currentPassword.set('');
        this.passwordForm.newPassword.set('');
        this.passwordForm.confirmPassword.set('');
        
        this.toastService.success('Password updated successfully');
      },
      error: (error) => {
        this.isUpdatingPassword.set(false);
        console.error('Error updating password:', error);
        // Toast error is handled automatically by the API interceptor/service
      },
    });
  }

  onLogout(): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Log out',
      zDescription: 'Are you sure you want to log out?',
      zOkText: 'Log out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

