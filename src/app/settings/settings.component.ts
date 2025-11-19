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
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardAccordionComponent } from '@shared/components/accordion/accordion.component';
import { ZardAccordionItemComponent } from '@shared/components/accordion/accordion-item.component';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import type { TeamMember } from '@shared/models/user/team-member.model';
import { ThemeService, type ThemePreset } from '@shared/services/theme.service';
import { SettingsService } from '@shared/services/settings.service';
import type { Settings } from '@shared/models/settings/settings.model';
import type { Category } from '@shared/models/settings/category.model';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import type { UserPermissions } from '@shared/models/user/user-permissions.model';
import { MODULES } from '@shared/constants/modules.constant';

type SettingsSection = 'account' | 'security' | 'team' | 'application';

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
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardBadgeComponent,
    ZardCheckboxComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly toastService = inject(ToastService);
  private readonly themeService = inject(ThemeService);
  private readonly settingsService = inject(SettingsService);
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

  // Permissions state for each user
  userPermissions = signal<Map<string, UserPermissions | null>>(new Map());
  isLoadingPermissions = signal<Map<string, boolean>>(new Map());
  isSavingPermissions = signal<Map<string, boolean>>(new Map());
  editingUserId = signal<string | null>(null);

  readonly modules = MODULES;

  // Application Settings
  appSettings = {
  };

  // Theme settings
  readonly currentTheme = this.themeService.getCurrentThemeSignal();
  readonly themePresets = this.themeService.themePresets;

  // Property Settings
  propertySettings = {
    defaultCity: signal(''),
    categories: signal<Category[]>([]),
    features: signal<string[]>([]),
    amenities: signal<string[]>([]),
    propertyTypes: signal<string[]>([]),
  };

  // Loading state for property settings
  isLoadingPropertySettings = signal(false);
  isSavingPropertySettings = signal(false);

  // Input states for adding new items
  showAddPropertyTypeInput = signal(false);
  showAddFeatureInput = signal(false);
  showAddAmenityInput = signal(false);
  newPropertyType = signal('');
  newFeature = signal('');
  newAmenity = signal('');

  onThemeChange(theme: string): void {
    this.themeService.setTheme(theme as ThemePreset);
  }

  /**
   * Get icon for a role based on role value
   */
  getRoleIcon(role: string): 'user' | 'users' {
    const roleLower = role?.toLowerCase() || '';
    if (roleLower.includes('admin')) return 'user';
    return 'users'; // default icon for User role
  }

  /**
   * Check if a team member is the current user
   */
  isCurrentUser(member: TeamMember): boolean {
    const user = this.currentUser();
    if (!user || !user.id) return false;
    return user.id === member.id;
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

    // Load property settings
    this.loadPropertySettings();
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
   * Toggle permissions editing for a team member
   */
  togglePermissions(member: TeamMember): void {
    const currentEditing = this.editingUserId();
    if (currentEditing === member.id) {
      // Close permissions
      this.editingUserId.set(null);
    } else {
      // Open permissions for this user
      this.editingUserId.set(member.id);
      // Load permissions if not already loaded
      if (!this.userPermissions().has(member.id)) {
        this.loadUserPermissions(member.id);
      }
    }
  }

  /**
   * Load permissions for a user
   */
  loadUserPermissions(userId: string): void {
    const loadingMap = new Map(this.isLoadingPermissions());
    loadingMap.set(userId, true);
    this.isLoadingPermissions.set(loadingMap);

    this.userService.getUserPermissions(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          const permsMap = new Map(this.userPermissions());
          permsMap.set(userId, permissions);
          this.userPermissions.set(permsMap);
          
          const loadingMap = new Map(this.isLoadingPermissions());
          loadingMap.set(userId, false);
          this.isLoadingPermissions.set(loadingMap);
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          const loadingMap = new Map(this.isLoadingPermissions());
          loadingMap.set(userId, false);
          this.isLoadingPermissions.set(loadingMap);
          this.toastService.error('Failed to load permissions');
        }
      });
  }

  /**
   * Get permissions for a user
   */
  getUserPermissions(userId: string): UserPermissions | null {
    return this.userPermissions().get(userId) || null;
  }

  /**
   * Check if permissions are loading for a user
   */
  isUserPermissionsLoading(userId: string): boolean {
    return this.isLoadingPermissions().get(userId) || false;
  }

  /**
   * Check if permissions are saving for a user
   */
  isUserPermissionsSaving(userId: string): boolean {
    return this.isSavingPermissions().get(userId) || false;
  }

  /**
   * Get permission value for a module
   */
  getPermission(userId: string, moduleKey: string, permission: 'view' | 'edit' | 'delete'): boolean {
    const perms = this.getUserPermissions(userId);
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.[permission] ?? false;
  }

  /**
   * Get all permissions for a module
   */
  getAllPermission(userId: string, moduleKey: string): boolean {
    const perms = this.getUserPermissions(userId);
    if (!perms?.permissions) return false;
    const modulePerms = perms.permissions[moduleKey as keyof typeof perms.permissions];
    return modulePerms?.view && modulePerms?.edit && modulePerms?.delete || false;
  }

  /**
   * Update permission value
   */
  updatePermission(userId: string, moduleKey: string, permission: 'view' | 'edit' | 'delete', value: boolean): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) return;

    const updatedPerms = { ...perms };
    if (!updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions]) {
      updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions] = {
        view: false,
        edit: false,
        delete: false,
      };
    }

    const modulePerms = updatedPerms.permissions[moduleKey as keyof typeof updatedPerms.permissions];
    if (modulePerms) {
      modulePerms[permission] = value;
    }

    const permsMap = new Map(this.userPermissions());
    permsMap.set(userId, updatedPerms);
    this.userPermissions.set(permsMap);
  }

  /**
   * Update all permissions for a module
   */
  updateAllPermission(userId: string, moduleKey: string, value: boolean): void {
    this.updatePermission(userId, moduleKey, 'view', value);
    this.updatePermission(userId, moduleKey, 'edit', value);
    this.updatePermission(userId, moduleKey, 'delete', value);
  }

  /**
   * Toggle select all permissions
   */
  toggleSelectAll(userId: string): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) return;

    const allSelected = this.modules.every(module => 
      this.getPermission(userId, module.key, 'view') && 
      this.getPermission(userId, module.key, 'edit') && 
      this.getPermission(userId, module.key, 'delete')
    );

    const newValue = !allSelected;

    this.modules.forEach(module => {
      this.updateAllPermission(userId, module.key, newValue);
    });
  }

  /**
   * Save permissions for a user
   */
  saveUserPermissions(userId: string): void {
    const perms = this.getUserPermissions(userId);
    if (!perms) {
      this.toastService.error('No permissions to save');
      return;
    }

    const savingMap = new Map(this.isSavingPermissions());
    savingMap.set(userId, true);
    this.isSavingPermissions.set(savingMap);

    this.userService.updateUserPermissions(userId, perms.permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPermissions) => {
          const permsMap = new Map(this.userPermissions());
          permsMap.set(userId, updatedPermissions);
          this.userPermissions.set(permsMap);
          
          const savingMap = new Map(this.isSavingPermissions());
          savingMap.set(userId, false);
          this.isSavingPermissions.set(savingMap);
          
          // Close the permissions section after successful save
          this.editingUserId.set(null);
          
          this.toastService.success('Permissions updated successfully');
          // Reload team members to reflect any role changes
          this.loadTeamMembers();
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          const savingMap = new Map(this.isSavingPermissions());
          savingMap.set(userId, false);
          this.isSavingPermissions.set(savingMap);
          // Error toast is handled by API interceptor
        }
      });
  }


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

  /**
   * Load property settings from API
   */
  loadPropertySettings(): void {
    this.isLoadingPropertySettings.set(true);
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            this.propertySettings.defaultCity.set(settings.defaultCity || '');
            this.propertySettings.categories.set(settings.categories || []);
            this.propertySettings.features.set(settings.features || []);
            this.propertySettings.amenities.set(settings.amenities || []);
            this.propertySettings.propertyTypes.set(settings.propertyTypes || []);
          } else {
            console.warn('Settings is null or undefined');
            // Initialize with empty values if settings is null/undefined
            this.propertySettings.defaultCity.set('');
            this.propertySettings.categories.set([]);
            this.propertySettings.features.set([]);
            this.propertySettings.amenities.set([]);
            this.propertySettings.propertyTypes.set([]);
          }
          this.isLoadingPropertySettings.set(false);
        },
        error: (error) => {
          console.error('Error loading property settings:', error);
          this.isLoadingPropertySettings.set(false);
          this.toastService.error('Failed to load property settings');
        }
      });
  }

  /**
   * Save property settings
   */
  onSavePropertySettings(): void {
    this.isSavingPropertySettings.set(true);

    const updateRequest = {
      defaultCity: this.propertySettings.defaultCity(),
      categories: this.propertySettings.categories(),
      features: this.propertySettings.features(),
      amenities: this.propertySettings.amenities(),
      propertyTypes: this.propertySettings.propertyTypes(),
    };

    this.settingsService.updateSettings(updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          if (settings) {
            this.propertySettings.defaultCity.set(settings.defaultCity || '');
            this.propertySettings.categories.set(settings.categories || []);
            this.propertySettings.features.set(settings.features || []);
            this.propertySettings.amenities.set(settings.amenities || []);
            this.propertySettings.propertyTypes.set(settings.propertyTypes || []);
            
            // Update localStorage with the updated settings
            localStorage.setItem('settings', JSON.stringify(settings));
          }
          this.isSavingPropertySettings.set(false);
          this.toastService.success('Property settings updated successfully');
        },
        error: (error) => {
          console.error('Error updating property settings:', error);
          this.isSavingPropertySettings.set(false);
          // Toast error is handled automatically by the API interceptor/service
        }
      });
  }

  /**
   * Add property type
   */
  addPropertyType(): void {
    const value = this.newPropertyType().trim();
    if (value && !this.propertySettings.propertyTypes().includes(value)) {
      this.propertySettings.propertyTypes.update(types => [...types, value]);
      this.newPropertyType.set('');
      this.showAddPropertyTypeInput.set(false);
    }
  }

  /**
   * Remove property type
   */
  removePropertyType(type: string): void {
    this.propertySettings.propertyTypes.update(types => types.filter(t => t !== type));
  }

  /**
   * Add feature
   */
  addFeature(): void {
    const value = this.newFeature().trim();
    if (value && !this.propertySettings.features().includes(value)) {
      this.propertySettings.features.update(features => [...features, value]);
      this.newFeature.set('');
      this.showAddFeatureInput.set(false);
    }
  }

  /**
   * Remove feature
   */
  removeFeature(feature: string): void {
    this.propertySettings.features.update(features => features.filter(f => f !== feature));
  }

  /**
   * Add amenity
   */
  addAmenity(): void {
    const value = this.newAmenity().trim();
    if (value && !this.propertySettings.amenities().includes(value)) {
      this.propertySettings.amenities.update(amenities => [...amenities, value]);
      this.newAmenity.set('');
      this.showAddAmenityInput.set(false);
    }
  }

  /**
   * Remove amenity
   */
  removeAmenity(amenity: string): void {
    this.propertySettings.amenities.update(amenities => amenities.filter(a => a !== amenity));
  }

  /**
   * Update category reference
   */
  updateCategoryReference(key: string, reference: string): void {
    this.propertySettings.categories.update(categories => 
      categories.map(cat => cat.key === key ? { ...cat, reference } : cat)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

