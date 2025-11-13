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
import { Subject, takeUntil } from 'rxjs';
import { toast } from 'ngx-sonner';

type SettingsSection = 'account' | 'security' | 'plan-billing' | 'team' | 'application';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'User';
  permissions: string;
}

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
  private readonly viewContainerRef = inject(ViewContainerRef);
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

  // Profile image
  profileImageUrl = signal<string | null>(null);
  profileImageFile = signal<File | null>(null);

  // Computed signal to check if account form is valid (all required fields filled)
  readonly isAccountFormValid = computed(() => {
    return this.userInfo.fullName() && this.userInfo.fullName().trim() !== '';
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
    currentPassword: '',
    newPassword: '',
  };
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  // Team Members
  teamMembers = signal<TeamMember[]>([
    {
      id: '1',
      name: 'No name',
      email: 'admin@admin.com',
      role: 'Administrator',
      permissions: 'No permissions set.',
    },
    {
      id: '2',
      name: 'No name',
      email: 'user@boilerplate.com',
      role: 'User',
      permissions: 'No permissions set.',
    },
  ]);

  // Application Settings
  appSettings = {
    language: 'fr',
  };

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
  }

  // Property Settings
  propertySettings = {
    defaultCity: '',
    locationRef: 'AL',
    saleRef: 'AV',
    vacationRef: 'VC',
  };

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  isPasswordFormValid(): boolean {
    return this.passwordForm.currentPassword.length > 0 && this.passwordForm.newPassword.length >= 8;
  }

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

  onRemoveImage(): void {
    this.profileImageUrl.set(null);
    this.profileImageFile.set(null);
    // Reset file input
    this.fileInput().nativeElement.value = '';
  }

  onSaveUserInfo(): void {
    // Validate required fields
    const fullName = this.userInfo.fullName();
    if (!fullName || fullName.trim() === '') {
      toast.error('Full name is required');
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    // Prepare user data for update
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
        toast.error('Failed to read image file');
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
        toast.success('Account information updated successfully');
        
        // Clear the file reference after successful update
        this.profileImageFile.set(null);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error updating user info:', error);
        
        // Show error message
        let errorMessage = 'Failed to update account information';
        if (error.errors && error.errors.length > 0) {
          errorMessage = error.errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      },
    });
  }

  onSavePassword(): void {
    // Save password logic
    console.log('Saving password');
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

