import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class EditContactComponent {
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

  constructor(private router: Router) {}

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
    const data = this.formData();
    
    // Basic validation
    if (data.isCompany) {
      if (!data.companyName || !data.ice || !data.rc) {
        alert('Please fill in all company information fields');
        return;
      }
    } else {
      if (!data.firstName || !data.lastName || !data.identifier) {
        alert('Please fill in all personal information fields');
        return;
      }
    }

    if (!data.phoneNumbers[0] || data.phoneNumbers[0].trim() === '') {
      alert('Please enter at least one phone number');
      return;
    }

    // TODO: Implement save logic (API call)
    console.log('Saving contact:', data);
    console.log('Uploaded files:', this.uploadedFiles());
    
    // Navigate back to list
    this.router.navigate(['/contact/list']);
  }

  onCancel(): void {
    // Navigate back to list
    this.router.navigate(['/contact/list']);
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

