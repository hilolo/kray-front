import { Component, computed, ElementRef, signal, TemplateRef, viewChild } from '@angular/core';
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
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { inject, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

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
    ZardDividerComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
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
    fullName: '',
    phone: '',
  };

  // Profile image
  profileImageUrl = signal<string | null>(null);
  profileImageFile = signal<File | null>(null);

  // Company Information (read-only)
  companyInfo = {
    name: 'IMMOSYNCPRO',
    address: 'bassatine',
    city: 'tanger',
    phone: '0605934495',
    website: 'www.immoyncpro.com',
    rc: '43 43 43 43',
    ice: '51250111',
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
    // Save user info logic
    const userData = {
      ...this.userInfo,
      profileImage: this.profileImageFile(),
      profileImageUrl: this.profileImageUrl(),
    };
    console.log('Saving user info:', userData);
    
    // Here you would typically:
    // 1. Upload the image file to your server
    // 2. Get the server URL for the uploaded image
    // 3. Save the user info with the image URL
    
    // Example API call (uncomment and adjust as needed):
    // if (this.profileImageFile()) {
    //   const formData = new FormData();
    //   formData.append('image', this.profileImageFile()!);
    //   formData.append('fullName', this.userInfo.fullName);
    //   formData.append('phone', this.userInfo.phone);
    //   // ... make HTTP request to save
    // }
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

