import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ZardTimePickerComponent } from '@shared/components/time-picker/time-picker.component';
import { MaintenanceService } from '@shared/services/maintenance.service';
import { PropertyService } from '@shared/services/property.service';
import { ContactService } from '@shared/services/contact.service';
import { ToastService } from '@shared/services/toast.service';
import type { Maintenance } from '@shared/models/maintenance/maintenance.model';
import { MaintenanceStatus, MaintenancePriority } from '@shared/models/maintenance/maintenance.model';
import type { CreateMaintenanceRequest } from '@shared/models/maintenance/create-maintenance-request.model';
import type { UpdateMaintenanceRequest } from '@shared/models/maintenance/update-maintenance-request.model';
import type { Property } from '@shared/models/property/property.model';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';

@Component({
  selector: 'app-edit-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardComboboxComponent,
    ZardDatePickerComponent,
    ZardTimePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-maintenance.component.html',
})
export class EditMaintenanceComponent implements OnInit, OnDestroy {
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ maintenanceId?: string }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly maintenanceId = signal<string | null>(this.dialogData?.maintenanceId || null);
  readonly isEditMode = computed(() => this.maintenanceId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly formSubmitted = signal(false);

  // Form data
  readonly formData = signal({
    propertyId: '',
    contactId: '',
    priority: MaintenancePriority.Low, // Default to first option
    status: MaintenanceStatus.Waiting, // Default to first option
    subject: '',
    description: '',
    scheduledDate: null as Date | null,
    scheduledTime: '',
  });

  // Properties
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  // Contacts
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingContacts = signal(false);

  // Priority options with icons
  readonly priorityOptions = [
    { value: String(MaintenancePriority.Low), label: 'Low', icon: 'circle-check' as const },
    { value: String(MaintenancePriority.Medium), label: 'Medium', icon: 'triangle-alert' as const },
    { value: String(MaintenancePriority.Urgent), label: 'Urgent', icon: 'zap' as const },
  ];

  // Status options with icons
  readonly statusOptions = [
    { value: String(MaintenanceStatus.Waiting), label: 'Waiting', icon: 'loader-circle' as const },
    { value: String(MaintenanceStatus.InProgress), label: 'In Progress', icon: 'refresh-cw' as const },
    { value: String(MaintenanceStatus.Done), label: 'Done', icon: 'check' as const },
    { value: String(MaintenanceStatus.Cancelled), label: 'Cancelled', icon: 'x' as const },
  ];

  // Helper methods to get icon for selected values
  getSelectedPriorityIcon(): 'circle-check' | 'triangle-alert' | 'zap' {
    const priority = this.formData().priority;
    const option = this.priorityOptions.find(opt => Number(opt.value) === priority);
    return (option?.icon || 'circle-check') as 'circle-check' | 'triangle-alert' | 'zap';
  }

  getSelectedStatusIcon(): 'loader-circle' | 'refresh-cw' | 'check' | 'x' {
    const status = this.formData().status;
    const option = this.statusOptions.find(opt => Number(opt.value) === status);
    return (option?.icon || 'loader-circle') as 'loader-circle' | 'refresh-cw' | 'check' | 'x';
  }

  getPriorityLabel(priority: MaintenancePriority): string {
    const option = this.priorityOptions.find(opt => Number(opt.value) === priority);
    return option?.label || 'Low';
  }

  getStatusLabel(status: MaintenanceStatus): string {
    const option = this.statusOptions.find(opt => Number(opt.value) === status);
    return option?.label || 'Waiting';
  }

  // Icon templates
  readonly homeIconTemplate = viewChild.required<TemplateRef<void>>('homeIconTemplate');
  readonly userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.propertyId !== '' &&
      data.contactId !== '' &&
      data.subject.trim() !== '' &&
      data.description.trim() !== '' &&
      data.scheduledDate !== null &&
      data.scheduledTime !== ''
    );
  });

  // Error messages
  readonly propertyIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (!this.formData().propertyId || this.formData().propertyId === '') {
      return 'Property is required';
    }
    return '';
  });

  readonly contactIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (!this.formData().contactId || this.formData().contactId === '') {
      return 'Service is required';
    }
    return '';
  });

  readonly subjectError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().subject;
    if (!value || value.trim() === '') {
      return 'Subject is required';
    }
    return '';
  });

  readonly descriptionError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().description;
    if (!value || value.trim() === '') {
      return 'Description is required';
    }
    return '';
  });

  readonly scheduledDateError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (!this.formData().scheduledDate) {
      return 'Scheduled date is required';
    }
    return '';
  });

  readonly scheduledTimeError = computed(() => {
    if (!this.formSubmitted()) return '';
    if (!this.formData().scheduledTime || this.formData().scheduledTime === '') {
      return 'Scheduled time is required';
    }
    return '';
  });

  ngOnInit(): void {
    this.loadProperties();
    this.loadContacts();
    
    if (this.isEditMode()) {
      this.loadMaintenance();
    } else {
      // Set default scheduled date/time to now
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.formData.update(data => ({
        ...data,
        scheduledDate: now,
        scheduledTime: `${hours}:${minutes}`,
      }));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMaintenance(): void {
    const id = this.maintenanceId();
    if (!id) return;

    this.isLoading.set(true);
    this.maintenanceService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (maintenance) => {
        const scheduledDate = new Date(maintenance.scheduledDateTime);
        const hours = String(scheduledDate.getHours()).padStart(2, '0');
        const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
        
        // Backend now returns priority and status as numbers directly
        const priority = maintenance.priority as MaintenancePriority;
        const status = maintenance.status as MaintenanceStatus;
        
        this.formData.set({
          propertyId: maintenance.propertyId || '',
          contactId: maintenance.contactId || '',
          priority: priority,
          status: status,
          subject: maintenance.subject || '',
          description: maintenance.description || '',
          scheduledDate: scheduledDate,
          scheduledTime: `${hours}:${minutes}`,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading maintenance:', error);
        this.toastService.error('Failed to load maintenance');
        this.isLoading.set(false);
      },
    });
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
    };
    
    this.propertyService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.properties.set(response.result);
        const options: ZardComboboxOption[] = response.result.map(property => ({
          value: property.id,
          label: this.getPropertyDisplayNameWithAddress(property),
        }));
        this.propertyOptions.set(options);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.isLoadingProperties.set(false);
      },
    });
  }

  getPropertyDisplayNameWithAddress(property: Property): string {
    const name = property.name || 'Unnamed Property';
    const identifier = property.identifier || '';
    const address = property.address || '';
    const city = property.city || '';
    
    // Build display string with name, reference (identifier), and address
    let display = name;
    
    // Add reference (identifier) if available
    if (identifier) {
      display = `${name} (${identifier})`;
    }
    
    // Add address if available
    if (address) {
      const fullAddress = city ? `${address}, ${city}` : address;
      display = `${display} - ${fullAddress}`;
    } else if (city) {
      display = `${display} - ${city}`;
    }
    
    return display;
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    
    // Load only Service contacts
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true, // Get all contacts
      type: ContactType.Service,
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.contacts.set(response.result);
        const options: ZardComboboxOption[] = response.result.map(contact => ({
          value: contact.id,
          label: this.getContactDisplayName(contact),
        }));
        this.contactOptions.set(options);
        this.isLoadingContacts.set(false);
      },
      error: (error: any) => {
        console.error('Error loading service contacts:', error);
        this.isLoadingContacts.set(false);
      },
    });
  }

  getContactDisplayName(contact: Contact): string {
    let displayName = '';
    
    if (contact.isACompany && contact.companyName) {
      displayName = contact.companyName;
    } else {
      const parts: string[] = [];
      if (contact.firstName) parts.push(contact.firstName);
      if (contact.lastName) parts.push(contact.lastName);
      if (parts.length === 0 && contact.companyName) {
        displayName = contact.companyName;
      } else {
        displayName = parts.join(' ') || 'Unknown';
      }
    }
    
    // Append identifier in parentheses if it exists
    if (contact.identifier && contact.identifier.trim() !== '') {
      return `${displayName} (${contact.identifier})`;
    }
    
    return displayName;
  }

  getScheduledDateTimeISO(): string {
    const date = this.formData().scheduledDate;
    const time = this.formData().scheduledTime;
    if (!date || !time) return '';
    
    const [hours, minutes] = time.split(':');
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours, 10));
    dateTime.setMinutes(parseInt(minutes, 10));
    return dateTime.toISOString();
  }

  updateField(field: string, value: any): void {
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }

  getPriorityString(priority: MaintenancePriority): string {
    return String(priority);
  }

  getStatusString(status: MaintenanceStatus): string {
    return String(status);
  }

  parsePriority(value: string | number): MaintenancePriority {
    // Ensure we convert to number properly
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    
    // Check for NaN
    if (isNaN(numValue)) {
      return MaintenancePriority.Low;
    }
    
    // Validate the value is a valid priority (1, 2, or 3)
    if (numValue === MaintenancePriority.Low || numValue === MaintenancePriority.Medium || numValue === MaintenancePriority.Urgent) {
      return numValue as MaintenancePriority;
    }
    // Default to Low if invalid
    return MaintenancePriority.Low;
  }

  parseStatus(value: string | number): MaintenanceStatus {
    // Ensure we convert to number properly
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    // Validate the value is a valid status
    if (numValue >= MaintenanceStatus.Waiting && numValue <= MaintenanceStatus.Cancelled) {
      return numValue as MaintenanceStatus;
    }
    // Default to Waiting if invalid
    console.warn('Invalid status value:', value, 'defaulting to Waiting');
    return MaintenanceStatus.Waiting;
  }

  onPriorityChange(value: any): void {
    const priority = this.parsePriority(value);
    this.updateField('priority', priority);
  }

  onStatusChange(value: any): void {
    const status = this.parseStatus(value);
    this.updateField('status', status);
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);

    const formData = this.formData();

    // Ensure priority and status are numbers (not strings)
    const priority = typeof formData.priority === 'number' 
      ? formData.priority 
      : parseInt(String(formData.priority), 10) as MaintenancePriority;
    const status = typeof formData.status === 'number' 
      ? formData.status 
      : parseInt(String(formData.status), 10) as MaintenanceStatus;

    if (this.isEditMode()) {
      const id = this.maintenanceId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }

      // Backend now expects enum as number (JsonStringEnumConverter removed)
      const request: UpdateMaintenanceRequest = {
        id,
        propertyId: formData.propertyId,
        priority: priority,
        contactId: formData.contactId,
        status: status,
        subject: formData.subject,
        description: formData.description,
        scheduledDateTime: this.getScheduledDateTimeISO(),
      };

      this.maintenanceService.update(id, request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (maintenance) => {
          this.toastService.success('Maintenance updated successfully');
          this.isSaving.set(false);
          this.formSubmitted.set(false);
          if (this.dialogRef) {
            this.dialogRef.close({ maintenanceId: maintenance.id });
          }
        },
        error: (error) => {
          console.error('Error updating maintenance:', error);
          this.toastService.error('Failed to update maintenance');
          this.isSaving.set(false);
        },
      });
    } else {
      // Backend now expects enum as number (JsonStringEnumConverter removed)
      const request: CreateMaintenanceRequest = {
        propertyId: formData.propertyId,
        priority: priority,
        contactId: formData.contactId,
        status: status,
        subject: formData.subject,
        description: formData.description,
        scheduledDateTime: this.getScheduledDateTimeISO(),
      };

      this.maintenanceService.create(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (maintenance) => {
          this.toastService.success('Maintenance created successfully');
          this.isSaving.set(false);
          this.formSubmitted.set(false);
          if (this.dialogRef) {
            this.dialogRef.close({ maintenanceId: maintenance.id });
          }
        },
        error: (error) => {
          console.error('Error creating maintenance:', error);
          this.toastService.error('Failed to create maintenance');
          this.isSaving.set(false);
        },
      });
    }
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

