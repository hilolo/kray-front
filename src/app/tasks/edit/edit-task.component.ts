import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import type { Task } from '@shared/models/task/task.model';
import { TaskPriority, TaskStatus } from '@shared/models/task/task.model';
import type { CreateTaskRequest } from '@shared/models/task/create-task-request.model';
import type { UpdateTaskRequest } from '@shared/models/task/update-task-request.model';
import { TaskService } from '@shared/services/task.service';
import { UserService } from '@shared/services/user.service';
import { ContactService } from '@shared/services/contact.service';
import { PropertyService } from '@shared/services/property.service';
import type { TeamMember } from '@shared/models/user/team-member.model';
import type { Contact } from '@shared/models/contact/contact.model';
import type { Property } from '@shared/models/property/property.model';
import { ContactType } from '@shared/models/contact/contact.model';
import { forkJoin } from 'rxjs';

type LinkToType = 'none' | 'contact' | 'property';

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDateTime: Date | null;
  assignedUserId: string;
  linkToType: LinkToType;
  contactId: string;
  propertyId: string;
}

@Component({
  selector: 'app-edit-task',
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
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardDatePickerComponent,
    ZardComboboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-task.component.html',
})
export class EditTaskComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ taskId?: string }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly taskId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.taskId() !== null);
  readonly isLoading = signal(false);
  readonly isDialogMode = computed(() => this.dialogRef !== null);

  // Form data
  readonly formData = signal<TaskFormData>({
    title: '',
    description: '',
    status: TaskStatus.ToDo,
    priority: TaskPriority.Medium,
    scheduledDateTime: new Date(),
    assignedUserId: '',
    linkToType: 'none',
    contactId: '',
    propertyId: '',
  });

  // Form validation state
  readonly formSubmitted = signal(false);
  readonly isSaving = signal(false);

  // Users for Assign To
  readonly users = signal<TeamMember[]>([]);
  readonly userOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingUsers = signal(false);

  // Contacts for Link To
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingContacts = signal(false);

  // Properties for Link To
  readonly properties = signal<Property[]>([]);
  readonly propertyOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingProperties = signal(false);

  // Icon templates
  readonly titleIconTemplate = viewChild.required<TemplateRef<void>>('titleIconTemplate');
  readonly userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');

  // Priority options with icons
  readonly priorityOptions = [
    { value: TaskPriority.Low, label: 'Low', icon: 'circle' as const },
    { value: TaskPriority.Medium, label: 'Medium', icon: 'circle-check' as const },
    { value: TaskPriority.High, label: 'High', icon: 'triangle-alert' as const },
    { value: TaskPriority.Critical, label: 'Critical', icon: 'triangle-alert' as const },
  ];

  // Status options
  readonly statusOptions = [
    { value: TaskStatus.ToDo, label: 'To Do', icon: 'circle' as const },
    { value: TaskStatus.InProgress, label: 'In Progress', icon: 'clock' as const },
    { value: TaskStatus.Completed, label: 'Completed', icon: 'circle-check' as const },
  ];

  // Link To options
  readonly linkToOptions = [
    { value: 'none', label: 'None' },
    { value: 'contact', label: 'Contact' },
    { value: 'property', label: 'Property' },
  ];

  // Form validation computed signals
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.title.trim() !== '' &&
      data.assignedUserId !== '' &&
      data.scheduledDateTime !== null
    );
  });

  // Error messages
  readonly titleError = computed(() => {
    if (!this.formSubmitted()) return '';
    const title = this.formData().title;
    if (!title || title.trim() === '') {
      return 'Title is required';
    }
    return '';
  });

  readonly assignedUserError = computed(() => {
    if (!this.formSubmitted()) return '';
    const assignedUserId = this.formData().assignedUserId;
    if (!assignedUserId || assignedUserId.trim() === '') {
      return 'Assigned user is required';
    }
    return '';
  });

  // Error states
  readonly titleHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().title || this.formData().title.trim() === '');
  });

  readonly assignedUserHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().assignedUserId || this.formData().assignedUserId.trim() === '');
  });

  // Computed for showing contact/property lists
  readonly showContactList = computed(() => {
    return this.formData().linkToType === 'contact';
  });

  readonly showPropertyList = computed(() => {
    return this.formData().linkToType === 'property';
  });

  ngOnInit(): void {
    // Check if we're in dialog mode with taskId
    if (this.dialogData?.taskId) {
      this.taskId.set(this.dialogData.taskId);
      this.loadTask(this.dialogData.taskId);
    } else {
      // Check if we're in edit mode (has ID in route params)
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'add') {
        this.taskId.set(id);
        this.loadTask(id);
      }
    }

    // Load users, contacts, and properties
    this.loadUsers();
    this.loadContacts();
    this.loadProperties();

    // Listen to route changes (only if not in dialog mode)
    if (!this.isDialogMode()) {
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const updatedId = params.get('id');
        if (updatedId && updatedId !== 'add') {
          if (updatedId !== this.taskId()) {
            this.taskId.set(updatedId);
            this.loadTask(updatedId);
          }
        } else {
          this.taskId.set(null);
          this.resetForm();
        }
      });
    }
  }

  /**
   * Load task data by ID
   */
  private loadTask(id: string): void {
    this.isLoading.set(true);
    
    this.taskService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (task) => {
          this.populateFormFromTask(task);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading task:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Populate form with task data
   */
  private populateFormFromTask(task: Task): void {
    // Determine link to type
    let linkToType: LinkToType = 'none';
    if (task.contactId) {
      linkToType = 'contact';
    } else if (task.propertyId) {
      linkToType = 'property';
    }

    this.formData.set({
      title: task.title || '',
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      scheduledDateTime: task.scheduledDateTime ? new Date(task.scheduledDateTime) : new Date(),
      assignedUserId: task.assignedUserId || '',
      linkToType: linkToType,
      contactId: task.contactId || '',
      propertyId: task.propertyId || '',
    });
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.formData.set({
      title: '',
      description: '',
      status: TaskStatus.ToDo,
      priority: TaskPriority.Medium,
      scheduledDateTime: new Date(),
      assignedUserId: '',
      linkToType: 'none',
      contactId: '',
      propertyId: '',
    });
    this.formSubmitted.set(false);
  }

  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.userService.getTeamMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          const options: ZardComboboxOption[] = users.map(user => ({
            value: user.id,
            label: user.name || user.email || 'Unknown',
          }));
          this.userOptions.set(options);
          this.isLoadingUsers.set(false);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers.set(false);
        },
      });
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    // Load contacts of all types (Owner, Tenant, Service)
    // We'll combine them into a single list
    const contactTypes = [ContactType.Owner, ContactType.Tenant, ContactType.Service];
    const requests = contactTypes.map(type => 
      this.contactService.list({
        currentPage: 1,
        pageSize: 1000,
        ignore: false,
        type: type,
      }).pipe(takeUntil(this.destroy$))
    );

    // Combine all requests
    forkJoin(requests).subscribe({
      next: (responses) => {
        // Combine all contacts from all types
        const allContacts: Contact[] = [];
        responses.forEach(response => {
          allContacts.push(...response.result);
        });
        
        this.contacts.set(allContacts);
        const options: ZardComboboxOption[] = allContacts.map(contact => ({
          value: contact.id,
          label: this.getContactDisplayNameWithReference(contact),
        }));
        this.contactOptions.set(options);
        this.isLoadingContacts.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoadingContacts.set(false);
      },
    });
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000, // Large page size to get all properties
      ignore: false,
      // Only get non-archived properties
      isArchived: false,
    };
    
    this.propertyService.list(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  getContactDisplayName(contact: Contact): string {
    if (contact.isACompany && contact.companyName) {
      return contact.companyName;
    }
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    return name || contact.identifier || 'Unnamed Contact';
  }

  getContactDisplayNameWithReference(contact: Contact): string {
    const name = this.getContactDisplayName(contact);
    const reference = contact.identifier || '';
    if (reference) {
      return `${name} (${reference})`;
    }
    return name;
  }

  getPropertyDisplayNameWithAddress(property: Property): string {
    const name = property.name || property.identifier || 'Unnamed Property';
    const identifier = property.identifier || '';
    const address = property.address || '';
    
    // Build display string with identifier and address
    let display = name;
    
    // Add identifier if available and different from name
    if (identifier && identifier !== name) {
      display = `${name} (${identifier})`;
    }
    
    // Add address if available
    if (address) {
      display = `${display} - ${address}`;
    }
    
    return display;
  }

  onLinkToTypeChange(type: string): void {
    const linkToType = type as LinkToType;
    this.formData.update(data => ({
      ...data,
      linkToType: linkToType,
      // Clear contact/property when changing type
      contactId: linkToType === 'contact' ? data.contactId : '',
      propertyId: linkToType === 'property' ? data.propertyId : '',
    }));
  }

  onContactChange(contactId: string | null): void {
    this.formData.update(data => ({
      ...data,
      contactId: contactId || '',
    }));
  }

  onPropertyChange(propertyId: string | null): void {
    this.formData.update(data => ({
      ...data,
      propertyId: propertyId || '',
    }));
  }

  onAssignedUserChange(userId: string | null): void {
    this.formData.update(data => ({
      ...data,
      assignedUserId: userId || '',
    }));
  }

  onScheduledDateChange(date: Date | null): void {
    this.formData.update(data => ({
      ...data,
      scheduledDateTime: date,
    }));
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
    const taskId = this.taskId();

    // Prepare scheduled date
    const scheduledDateTime = data.scheduledDateTime || new Date();

    // Check if we're in edit mode
    if (taskId && this.isEditMode()) {
      // Update existing task
      const request: UpdateTaskRequest = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        status: data.status,
        priority: data.priority,
        scheduledDateTime: scheduledDateTime.toISOString(),
        assignedUserId: data.assignedUserId,
        contactId: data.linkToType === 'contact' ? data.contactId : undefined,
        propertyId: data.linkToType === 'property' ? data.propertyId : undefined,
      };

      this.taskService.update(taskId, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedTask) => {
            console.log('Task updated successfully:', updatedTask);
            
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ taskId: updatedTask.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/tasks']);
            }
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.isSaving.set(false);
          },
        });
    } else {
      // Create new task
      const request: CreateTaskRequest = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        status: data.status,
        priority: data.priority,
        scheduledDateTime: scheduledDateTime.toISOString(),
        assignedUserId: data.assignedUserId,
        contactId: data.linkToType === 'contact' ? data.contactId : undefined,
        propertyId: data.linkToType === 'property' ? data.propertyId : undefined,
      };

      this.taskService.create(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdTask) => {
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ taskId: createdTask.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/tasks']);
            }
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.isSaving.set(false);
          },
        });
    }
  }

  onCancel(): void {
    // If in dialog mode, close dialog
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Navigate back to list
      this.router.navigate(['/tasks']);
    }
  }

  getPriorityLabel(): string {
    const priority = this.formData().priority;
    const option = this.priorityOptions.find(o => o.value === priority);
    if (option) {
      return option.label;
    }
    return 'Select';
  }

  getPriorityIcon(): string {
    const priority = this.formData().priority;
    const option = this.priorityOptions.find(o => o.value === priority);
    return option?.icon || 'circle';
  }

  getLinkToLabel(): string {
    const linkToType = this.formData().linkToType;
    const option = this.linkToOptions.find(o => o.value === linkToType);
    return option?.label || 'Select';
  }

  getAssignedUserLabel(): string {
    const userId = this.formData().assignedUserId;
    if (!userId) return 'Select user';
    const user = this.users().find(u => u.id === userId);
    return user ? (user.name || user.email || 'Unknown') : 'Select user';
  }

  getContactLabel(): string {
    const contactId = this.formData().contactId;
    if (!contactId) return 'Select contact';
    const contact = this.contacts().find(c => c.id === contactId);
    return contact ? this.getContactDisplayNameWithReference(contact) : 'Select contact';
  }

  getPropertyLabel(): string {
    const propertyId = this.formData().propertyId;
    if (!propertyId) return 'Select property';
    const property = this.properties().find(p => p.id === propertyId);
    return property ? this.getPropertyDisplayNameWithAddress(property) : 'Select property';
  }

  // Helper methods for template
  updateTitle(value: string): void {
    this.formData.update(data => ({ ...data, title: value }));
  }

  updateDescription(value: string): void {
    this.formData.update(data => ({ ...data, description: value }));
  }

  updatePriority(value: string): void {
    this.formData.update(data => ({ ...data, priority: +value as TaskPriority }));
  }

  updateStatus(value: string): void {
    this.formData.update(data => ({ ...data, status: +value as TaskStatus }));
  }

  getStatusLabel(): string {
    const status = this.formData().status;
    const option = this.statusOptions.find(o => o.value === status);
    if (option) {
      return option.label;
    }
    return 'Select';
  }

  getStatusIcon(): string {
    const status = this.formData().status;
    const option = this.statusOptions.find(o => o.value === status);
    return option?.icon || 'circle';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

