import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ContactType, routeParamToContactType, contactTypeToRouteParam, stringToContactType, type Contact, type Attachment } from '@shared/models/contact/contact.model';
import type { ContactFormData } from '@shared/models/contact/contact-form.model';
import type { CreateContactRequest, AttachmentInput } from '@shared/models/contact/create-contact-request.model';
import type { UpdateContactRequest } from '@shared/models/contact/update-contact-request.model';
import { ContactService } from '@shared/services/contact.service';
import { UserService } from '@shared/services/user.service';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSwitchComponent } from '@shared/components/switch/switch.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';
import { ZardImageHoverPreviewDirective } from '@shared/components/image-hover-preview/image-hover-preview.component';
import { ImageItem } from '@shared/image-viewer/image-viewer.component';
import { getFileViewerType } from '@shared/utils/file-type.util';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file: File;
}

interface ExistingAttachment {
  id: string;
  name: string;
  size: number;
  url: string;
  createdAt: string;
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
    ZardFileViewerComponent,
    ZardImageHoverPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-contact.component.html',
})
export class EditContactComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);
  private readonly userService = inject(UserService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ contactType?: ContactType }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly contactType = signal<ContactType>(ContactType.Tenant);
  readonly contactId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.contactId() !== null);
  readonly isLoading = signal(false);
  readonly isDialogMode = computed(() => this.dialogRef !== null);

  // Effect to ensure contactType is set from dialogData if provided (runs immediately on init)
  private readonly contactTypeEffect = effect(() => {
    // If dialogData has contactType, ensure it's set (this runs immediately when component is created)
    if (this.dialogData?.contactType !== undefined) {
      const currentType = this.contactType();
      if (currentType !== this.dialogData.contactType) {
        this.contactType.set(this.dialogData.contactType);
      }
    }
  });
  
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
  readonly existingAttachments = signal<ExistingAttachment[]>([]);
  readonly attachmentsToDelete = signal<Set<string>>(new Set()); // Track attachment IDs to delete
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // File viewer
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal<string>('');
  readonly fileViewerName = signal<string>('');
  readonly fileViewerSize = signal<number>(0);
  readonly fileViewerImages = signal<ImageItem[]>([]); // All images for navigation
  readonly fileViewerCurrentIndex = signal<number>(0); // Current image index

  // Icon templates for input groups
  readonly userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');
  readonly idCardIconTemplate = viewChild.required<TemplateRef<void>>('idCardIconTemplate');
  readonly buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  readonly mailIconTemplate = viewChild.required<TemplateRef<void>>('mailIconTemplate');
  readonly phoneIconTemplate = viewChild.required<TemplateRef<void>>('phoneIconTemplate');

  // Computed values
  readonly isCompany = computed(() => this.formData().isCompany);
  readonly hasUploadedFiles = computed(() => this.uploadedFiles().length > 0);
  readonly hasExistingAttachments = computed(() => {
    const toDelete = this.attachmentsToDelete();
    return this.existingAttachments().some(att => !toDelete.has(att.id));
  });

  readonly existingAttachmentsCount = computed(() => {
    const toDelete = this.attachmentsToDelete();
    return this.existingAttachments().filter(att => !toDelete.has(att.id)).length;
  });
  readonly hasAnyAttachments = computed(() => this.hasUploadedFiles() || this.hasExistingAttachments());
  readonly uploadedFilesSize = computed(() => {
    return this.uploadedFiles().reduce((total, file) => total + file.size, 0);
  });
  readonly existingAttachmentsSize = computed(() => {
    // Only count attachments that are not marked for deletion
    const toDelete = this.attachmentsToDelete();
    return this.existingAttachments()
      .filter(att => !toDelete.has(att.id))
      .reduce((total, att) => total + att.size, 0);
  });
  readonly totalFileSize = computed(() => {
    return this.uploadedFilesSize() + this.existingAttachmentsSize();
  });

  // Get all images from attachments (for image viewer navigation)
  readonly allImages = computed<ImageItem[]>(() => {
    const images: ImageItem[] = [];
    const toDelete = this.attachmentsToDelete();
    
    // Add existing attachments that are images (excluding deleted ones)
    const existing = this.existingAttachments();
    existing.forEach(att => {
      if (!toDelete.has(att.id) && getFileViewerType(att.url) === 'image') {
        images.push({
          url: att.url,
          name: att.name,
          size: att.size,
        });
      }
    });
    
    // Add uploaded files that are images
    const uploaded = this.uploadedFiles();
    uploaded.forEach(file => {
      if (file.type.startsWith('image/')) {
        // For uploaded files, we don't have a URL yet, but we can create a preview
        // For now, we'll skip uploaded files until they're uploaded to the server
        // In a real scenario, you'd create object URLs for preview
      }
    });
    
    return images;
  });

  // Form validation computed signals
  readonly isFormValid = computed(() => {
    const data = this.formData();
    
    if (data.isCompany) {
      // Company validation
      return (
        data.companyName.trim() !== '' &&
        data.identifier.trim() !== '' &&
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
    // ICE is optional, no validation needed
    return '';
  });

  readonly rcError = computed(() => {
    // RC is optional, no validation needed
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
    if (!this.formSubmitted()) return '';
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
    // ICE is optional, no error state
    return false;
  });

  readonly rcHasError = computed(() => {
    // RC is optional, no error state
    return false;
  });

  readonly firstNameHasError = computed(() => {
    return this.formSubmitted() && !this.isCompany() && (!this.formData().firstName || this.formData().firstName.trim() === '');
  });

  readonly lastNameHasError = computed(() => {
    return this.formSubmitted() && !this.isCompany() && (!this.formData().lastName || this.formData().lastName.trim() === '');
  });

  readonly identifierHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().identifier || this.formData().identifier.trim() === '');
  });

  readonly phoneNumberHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().phoneNumbers[0] || this.formData().phoneNumbers[0].trim() === '');
  });

  ngOnInit(): void {
    // Check if we're in dialog mode (dialogData provided)
    if (this.dialogData?.contactType) {
      // Lock contactType when provided via dialog data (e.g., from property page)
      this.contactType.set(this.dialogData.contactType);
    } else {
      // Get contact type from route path
      // Routes: /contact/tenants/add, /contact/owners/add, /contact/services/add, /contact/tenants/:id
      const routePath = this.route.snapshot.routeConfig?.path || 'tenants/add';
      const typeParam = routePath.split('/')[0]; // Extract 'tenants', 'owners', or 'services'
      const type = routeParamToContactType(typeParam);
      this.contactType.set(type);
    }

    // Check if we're in edit mode (has ID in route params)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contactId.set(id);
      this.loadContact(id);
    }

    // Also listen to route changes in case of navigation
    // IMPORTANT: Skip contactType updates when in dialog mode to preserve the type passed from dialog
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Only update contactType from route if NOT in dialog mode
      if (!this.isDialogMode() && !this.dialogData?.contactType) {
        const updatedRoutePath = this.route.snapshot.routeConfig?.path || 'tenants/add';
        const updatedTypeParam = updatedRoutePath.split('/')[0];
        const updatedType = routeParamToContactType(updatedTypeParam);
        this.contactType.set(updatedType);
      }

      // Check for ID in route params
      const updatedId = this.route.snapshot.paramMap.get('id');
      if (updatedId && updatedId !== this.contactId()) {
        this.contactId.set(updatedId);
        this.loadContact(updatedId);
      } else if (!updatedId) {
        this.contactId.set(null);
        this.resetForm();
      }
    });
  }

  /**
   * Load contact data by ID
   */
  private loadContact(id: string): void {
    this.isLoading.set(true);
    
    this.contactService.getById(id, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact) => {
          this.populateFormFromContact(contact);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading contact:', error);
          this.isLoading.set(false);
          // Error is already handled by ApiService (toast notification)
        },
      });
  }

  /**
   * Populate form with contact data
   */
  private populateFormFromContact(contact: Contact): void {
    // Set contact type
    const type = stringToContactType(contact.type);
    this.contactType.set(type);

    // Populate form data
    this.formData.set({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      identifier: contact.identifier || '',
      companyName: contact.companyName || '',
      ice: contact.ice || '',
      rc: contact.rc || '',
      phoneNumbers: contact.phones && contact.phones.length > 0 ? contact.phones : [''],
      email: contact.email || '',
      isCompany: contact.isACompany,
    });

    // Set avatar if exists
    if (contact.avatar) {
      this.avatarUrl.set(contact.avatar);
    }

    // Set existing attachments
    if (contact.attachments && contact.attachments.length > 0) {
      const existing: ExistingAttachment[] = contact.attachments.map(att => ({
        id: att.id,
        name: att.originalFileName || att.fileName,
        size: att.fileSize,
        url: att.url,
        createdAt: att.createdAt,
      }));
      this.existingAttachments.set(existing);
    }
    
    // Reset attachments to delete when loading a contact
    this.attachmentsToDelete.set(new Set());
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.formData.set({
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
    this.avatarUrl.set(null);
    this.avatarFile.set(null);
    this.uploadedFiles.set([]);
    this.existingAttachments.set([]);
    this.attachmentsToDelete.set(new Set());
    this.formSubmitted.set(false);
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

  /**
   * Delete an existing attachment (mark for deletion)
   */
  onDeleteAttachment(attachmentId: string): void {
    this.attachmentsToDelete.update(set => {
      const newSet = new Set(set);
      newSet.add(attachmentId);
      return newSet;
    });
  }

  /**
   * Restore a deleted attachment (unmark for deletion)
   */
  onRestoreAttachment(attachmentId: string): void {
    this.attachmentsToDelete.update(set => {
      const newSet = new Set(set);
      newSet.delete(attachmentId);
      return newSet;
    });
  }

  /**
   * Check if an attachment is marked for deletion
   */
  isAttachmentMarkedForDeletion(attachmentId: string): boolean {
    return this.attachmentsToDelete().has(attachmentId);
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

  /**
   * Open file in appropriate viewer
   */
  openFile(url: string, name: string, size: number): void {
    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    
    // If it's an image, set up image navigation
    if (getFileViewerType(url) === 'image') {
      const allImages = this.allImages();
      // Find the index of the current image
      const currentIndex = allImages.findIndex(img => img.url === url);
      this.fileViewerCurrentIndex.set(currentIndex >= 0 ? currentIndex : 0);
      this.fileViewerImages.set(allImages);
    } else {
      // For non-images, clear images array
      this.fileViewerImages.set([]);
      this.fileViewerCurrentIndex.set(0);
    }
    
    this.fileViewerOpen.set(true);
  }

  /**
   * Handle image change event from file viewer
   */
  onImageChanged(index: number): void {
    this.fileViewerCurrentIndex.set(index);
    const images = this.fileViewerImages();
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      const image = images[index];
      this.fileViewerUrl.set(image.url);
      this.fileViewerName.set(image.name);
      this.fileViewerSize.set(image.size);
    }
  }

  /**
   * Check if file format is supported (can be viewed)
   */
  isFileFormatSupported(url: string): boolean {
    const viewerType = getFileViewerType(url);
    return viewerType !== 'unknown';
  }

  /**
   * Get file viewer type (for template use)
   */
  getFileViewerType(url: string): ReturnType<typeof getFileViewerType> {
    return getFileViewerType(url);
  }

  /**
   * Download file
   */
  downloadFile(url: string, name: string): void {
    // Fetch the file and trigger download
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        // Fallback: try direct download (may not work for cross-origin URLs)
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  // Form submission
  onSave(): void {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Get company ID from user service
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.companyId) {
      console.error('User or company ID not found');
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    const data = this.formData();
    // CRITICAL: Use dialogData.contactType if available (from property page), otherwise use signal value
    // This ensures the type is always correct when opened from property page
    let contactType = this.contactType();
    if (this.dialogData?.contactType !== undefined) {
      contactType = this.dialogData.contactType;
      // Also update the signal to keep it in sync
      if (this.contactType() !== contactType) {
        this.contactType.set(contactType);
      }
    }
    const contactId = this.contactId();

    // Check if we're in edit mode
    if (contactId && this.isEditMode()) {
      // Update existing contact
      this.prepareUpdateRequest(data, contactId, currentUser.companyId)
        .then((request) => {
          // Call the API
          this.contactService.update(contactId, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (updatedContact) => {
                // Reset form submitted state on successful submission
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                
                // If in dialog mode, close dialog with contactId
                if (this.dialogRef) {
                  this.dialogRef.close({ contactId: updatedContact.id });
                } else {
                  // Navigate back to list
                  this.router.navigate(['/contact', contactTypeToRouteParam(contactType)]);
                }
              },
              error: (error) => {
                console.error('Error updating contact:', error);
                this.isSaving.set(false);
                // Error is already handled by ApiService (toast notification)
              },
            });
        })
        .catch((error) => {
          console.error('Error preparing update request:', error);
          this.isSaving.set(false);
        });
    } else {
      // Create new contact
      this.prepareCreateRequest(data, contactType, currentUser.companyId)
        .then((request) => {
          // Call the API
          this.contactService.create(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (createdContact) => {
                // Reset form submitted state on successful submission
                this.formSubmitted.set(false);
                this.isSaving.set(false);
                
                // If in dialog mode, close dialog with contactId
                if (this.dialogRef) {
                  const result = { contactId: createdContact.id };
                  // Use setTimeout to ensure the result is set before closing
                  setTimeout(() => {
                    this.dialogRef!.close(result);
                  }, 50);
                } else {
                  // Navigate back to list
                  this.router.navigate(['/contact', contactTypeToRouteParam(contactType)]);
                }
              },
              error: (error) => {
                console.error('Error creating contact:', error);
                this.isSaving.set(false);
                // Error is already handled by ApiService (toast notification)
              },
            });
        })
        .catch((error) => {
          console.error('Error preparing request:', error);
          this.isSaving.set(false);
        });
    }
  }

  /**
   * Prepare CreateContactRequest from form data
   */
  private async prepareCreateRequest(
    formData: ContactFormData,
    contactType: ContactType,
    companyId: string
  ): Promise<CreateContactRequest> {
    const request: CreateContactRequest = {
      identifier: formData.identifier.trim(),
      type: contactType,
      isACompany: formData.isCompany,
      companyId: companyId,
    };

    // Add personal or company fields
    if (formData.isCompany) {
      request.companyName = formData.companyName.trim() || undefined;
      request.ice = formData.ice.trim() || undefined;
      request.rc = formData.rc.trim() || undefined;
    } else {
      request.firstName = formData.firstName.trim() || undefined;
      request.lastName = formData.lastName.trim() || undefined;
    }

    // Add contact details
    if (formData.email && formData.email.trim()) {
      request.email = formData.email.trim();
    }

    // Add phone numbers (filter out empty ones)
    const phones = formData.phoneNumbers
      .map((phone) => phone.trim())
      .filter((phone) => phone !== '');
    if (phones.length > 0) {
      request.phones = phones;
    }

    // Convert avatar to base64 if present
    const avatarFile = this.avatarFile();
    if (avatarFile) {
      try {
        const avatarBase64 = await this.fileToBase64(avatarFile);
        request.avatar = avatarBase64;
      } catch (error) {
        console.error('Error converting avatar to base64:', error);
      }
    }

    // Convert uploaded files to attachments
    const uploadedFiles = this.uploadedFiles();
    if (uploadedFiles.length > 0) {
      try {
        const attachments: AttachmentInput[] = await Promise.all(
          uploadedFiles.map(async (uploadedFile) => {
            const base64Content = await this.fileToBase64(uploadedFile.file);
            return {
              fileName: uploadedFile.name,
              base64Content: base64Content,
              root: 'contact', // Default root for contact attachments
            };
          })
        );
        request.attachments = attachments;
      } catch (error) {
        console.error('Error converting files to base64:', error);
      }
    }

    return request;
  }

  /**
   * Prepare UpdateContactRequest from form data
   */
  private async prepareUpdateRequest(
    formData: ContactFormData,
    contactId: string,
    companyId: string
  ): Promise<UpdateContactRequest> {
    const request: UpdateContactRequest = {
      id: contactId,
    };

    // Add personal or company fields
    if (formData.isCompany) {
      request.companyName = formData.companyName.trim() || undefined;
      request.ice = formData.ice.trim() || undefined;
      request.rc = formData.rc.trim() || undefined;
    } else {
      request.firstName = formData.firstName.trim() || undefined;
      request.lastName = formData.lastName.trim() || undefined;
    }

    // Add identifier if changed
    if (formData.identifier && formData.identifier.trim()) {
      request.identifier = formData.identifier.trim();
    }

    // Add contact details
    if (formData.email && formData.email.trim()) {
      request.email = formData.email.trim();
    }

    // Add phone numbers (filter out empty ones)
    const phones = formData.phoneNumbers
      .map((phone) => phone.trim())
      .filter((phone) => phone !== '');
    if (phones.length > 0) {
      request.phones = phones;
    }

    // Handle avatar
    const avatarFile = this.avatarFile();
    const currentAvatarUrl = this.avatarUrl();
    
    if (avatarFile) {
      // New avatar file selected - convert to base64
      try {
        const avatarBase64 = await this.fileToBase64(avatarFile);
        request.avatar = avatarBase64;
        request.removeAvatar = false;
      } catch (error) {
        console.error('Error converting avatar to base64:', error);
      }
    } else if (!currentAvatarUrl) {
      // Avatar was removed - set removeAvatar flag
      request.removeAvatar = true;
      request.avatar = undefined;
    } else {
      // Avatar not changed - preserve existing (don't send avatar field)
      // Backend will preserve existing avatar when avatar is null/empty and removeAvatar is false/not set
    }

    // Handle attachments to add (newly uploaded files)
    const uploadedFiles = this.uploadedFiles();
    if (uploadedFiles.length > 0) {
      try {
        const attachments: AttachmentInput[] = await Promise.all(
          uploadedFiles.map(async (uploadedFile) => {
            const base64Content = await this.fileToBase64(uploadedFile.file);
            return {
              fileName: uploadedFile.name,
              base64Content: base64Content,
              root: 'contact', // Default root for contact attachments
            };
          })
        );
        request.attachmentsToAdd = attachments;
      } catch (error) {
        console.error('Error converting files to base64:', error);
      }
    }

    // Handle attachments to delete
    const attachmentsToDelete = Array.from(this.attachmentsToDelete());
    if (attachmentsToDelete.length > 0) {
      request.attachmentsToDelete = attachmentsToDelete;
    }

    return request;
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  onCancel(): void {
    // Navigate back to list
    const type = this.contactType();
    this.router.navigate(['/contact', contactTypeToRouteParam(type)]);
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

