import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import type { ContactType } from '../list/contact-list.component';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardCardComponent } from '@shared/components/card/card.component';

interface ContactFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  identifier: string;
  
  // Company Information
  companyName: string;
  ice: string;
  rc: string;
  
  // Contact Details
  phoneNumbers: string[];
  email: string;
  
  // Settings
  isCompany: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file: File;
}

@Component({
  selector: 'app-edit-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardSwitchComponent,
    ZardCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-contact.component.html',
})
export class EditContactComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly contactType = signal<ContactType>('tenants');
  // Form data
  readonly formData = signal<ContactFormData>({
    firstName: '',
    lastName: '',
    identifier: '',
    companyName: '',
    ice: '',
    rc: '',
    phoneNumbers: [''],
    email: '',
    isCompany: false,
  });

  // Form validation state
  readonly formSubmitted = signal(false);
  readonly isSaving = signal(false);

  // Avatar/Profile image
  readonly avatarUrl = signal<string | null>(null);
  readonly avatarFile = signal<File | null>(null);
  readonly avatarInput = viewChild<ElementRef<HTMLInputElement>>('avatarInput');

  // File upload
  readonly uploadedFiles = signal<UploadedFile[]>([]);
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // Icon templates for input groups
  readonly userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');
  readonly idCardIconTemplate = viewChild.required<TemplateRef<void>>('idCardIconTemplate');
  readonly buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  readonly mailIconTemplate = viewChild.required<TemplateRef<void>>('mailIconTemplate');
  readonly phoneIconTemplate = viewChild.required<TemplateRef<void>>('phoneIconTemplate');

  // Computed values
  readonly isCompany = computed(() => this.formData().isCompany);
  readonly hasUploadedFiles = computed(() => this.uploadedFiles().length > 0);
  readonly totalFileSize = computed(() => {
    return this.uploadedFiles().reduce((total, file) => total + file.size, 0);
  });

  // Form validation computed signals
  readonly isFormValid = computed(() => {
    const data = this.formData();
    
    if (data.isCompany) {
      // Company validation
      return (
        data.companyName.trim() !== '' &&
        data.ice.trim() !== '' &&
        data.rc.trim() !== '' &&
        data.phoneNumbers[0] && data.phoneNumbers[0].trim() !== ''
      );
    } else {
      // Personal validation
      return (
        data.firstName.trim() !== '' &&
        data.lastName.trim() !== '' &&
        data.identifier.trim() !== '' &&
        data.phoneNumbers[0] && data.phoneNumbers[0].trim() !== ''
      );
    }
  });

  // Error messages for company fields
  readonly companyNameError = computed(() => {
    if (!this.formSubmitted() || !this.isCompany()) return '';
    const companyName = this.formData().companyName;
    if (!companyName || companyName.trim() === '') {
      return 'Company name is required';
    }
    return '';
  });

  readonly iceError = computed(() => {
    if (!this.formSubmitted() || !this.isCompany()) return '';
    const ice = this.formData().ice;
    if (!ice || ice.trim() === '') {
      return 'ICE is required';
    }
    return '';
  });

  readonly rcError = computed(() => {
    if (!this.formSubmitted() || !this.isCompany()) return '';
    const rc = this.formData().rc;
    if (!rc || rc.trim() === '') {
      return 'RC is required';
    }
    return '';
  });

  // Error messages for personal fields
  readonly firstNameError = computed(() => {
    if (!this.formSubmitted() || this.isCompany()) return '';
    const firstName = this.formData().firstName;
    if (!firstName || firstName.trim() === '') {
      return 'First name is required';
    }
    return '';
  });

  readonly lastNameError = computed(() => {
    if (!this.formSubmitted() || this.isCompany()) return '';
    const lastName = this.formData().lastName;
    if (!lastName || lastName.trim() === '') {
      return 'Last name is required';
    }
    return '';
  });

  readonly identifierError = computed(() => {
    if (!this.formSubmitted() || this.isCompany()) return '';
    const identifier = this.formData().identifier;
    if (!identifier || identifier.trim() === '') {
      return 'Identifier is required';
    }
    return '';
  });

  // Error message for phone number
  readonly phoneNumberError = computed(() => {
    if (!this.formSubmitted()) return '';
    const phoneNumber = this.formData().phoneNumbers[0];
    if (!phoneNumber || phoneNumber.trim() === '') {
      return 'Phone number is required';
    }
    return '';
  });

  // Error state for styling (hasError)
  readonly companyNameHasError = computed(() => {
    return this.formSubmitted() && this.isCompany() && (!this.formData().companyName || this.formData().companyName.trim() === '');
  });

  readonly iceHasError = computed(() => {
    return this.formSubmitted() && this.isCompany() && (!this.formData().ice || this.formData().ice.trim() === '');
  });

  readonly rcHasError = computed(() => {
    return this.formSubmitted() && this.isCompany() && (!this.formData().rc || this.formData().rc.trim() === '');
  });

  readonly firstNameHasError = computed(() => {
    return this.formSubmitted() && !this.isCompany() && (!this.formData().firstName || this.formData().firstName.trim() === '');
  });

  readonly lastNameHasError = computed(() => {
    return this.formSubmitted() && !this.isCompany() && (!this.formData().lastName || this.formData().lastName.trim() === '');
  });

  readonly identifierHasError = computed(() => {
    return this.formSubmitted() && !this.isCompany() && (!this.formData().identifier || this.formData().identifier.trim() === '');
  });

  readonly phoneNumberHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().phoneNumbers[0] || this.formData().phoneNumbers[0].trim() === '');
  });

  ngOnInit(): void {
    // Get contact type from route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const type = params['type'] as ContactType;
      if (type && ['tenants', 'owners', 'services'].includes(type)) {
        this.contactType.set(type);
      } else {
        this.contactType.set('tenants');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Company toggle handler
  onCompanyToggle(value: boolean): void {
    this.formData.update(data => ({
      ...data,
      isCompany: value,
      // Clear company-specific fields when toggling off
      ...(!value && {
        companyName: '',
        ice: '',
        rc: '',
      }),
    }));
  }

  // Avatar handlers
  onAvatarClick(): void {
    this.avatarInput()?.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
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
      this.avatarFile.set(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.avatarUrl.set(result);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    input.value = '';
  }

  onRemoveAvatar(): void {
    this.avatarUrl.set(null);
    this.avatarFile.set(null);
  }

  getInitials(): string {
    const data = this.formData();
    if (data.isCompany && data.companyName) {
      return data.companyName.charAt(0).toUpperCase();
    }
    if (data.firstName || data.lastName) {
      return `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();
    }
    return 'C';
  }

  // File upload handlers
  onUploadClick(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          file: file,
        };

        newFiles.push(uploadedFile);
      }

      if (newFiles.length > 0) {
        this.uploadedFiles.update(files => [...files, ...newFiles]);
      }
    }

    // Reset input
    input.value = '';
  }

  onRemoveFile(fileId: string): void {
    this.uploadedFiles.update(files => files.filter(f => f.id !== fileId));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(type: string): 'image' | 'file-text' | 'file-spreadsheet' | 'file' {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'file-text';
    if (type.includes('word') || type.includes('document')) return 'file-text';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'file-spreadsheet';
    return 'file';
  }

  // Form submission
  onSave(): void {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    const data = this.formData();

    // TODO: Implement save logic (API call)
    console.log('Saving contact:', data);
    console.log('Uploaded files:', this.uploadedFiles());
    
    // Simulate API call
    setTimeout(() => {
      // Reset form submitted state on successful submission
      this.formSubmitted.set(false);
      this.isSaving.set(false);
      
      // Navigate back to list
      const type = this.contactType();
      this.router.navigate(['/contact', type]);
    }, 1000);
  }

  onCancel(): void {
    // Navigate back to list
    const type = this.contactType();
    this.router.navigate(['/contact', type]);
  }

  // Phone number handlers
  addPhoneNumber(): void {
    this.formData.update(data => ({
      ...data,
      phoneNumbers: [...data.phoneNumbers, ''],
    }));
  }

  removePhoneNumber(index: number): void {
    this.formData.update(data => ({
      ...data,
      phoneNumbers: data.phoneNumbers.filter((_, i) => i !== index),
    }));
  }

  updatePhoneNumber(index: number, value: string): void {
    this.formData.update(data => ({
      ...data,
      phoneNumbers: data.phoneNumbers.map((phone, i) => i === index ? value : phone),
    }));
  }

  // Update form field helper
  updateField<K extends keyof ContactFormData>(field: K, value: ContactFormData[K]): void {
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }
}

