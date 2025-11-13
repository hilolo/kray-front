import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { TasksService } from '../tasks.service';
import {
    CreateTaskDto,
    Task,
    TaskPriority,
    TaskStatus,
    UpdateTaskDto,
    getTaskPriorityLabel,
    parseTaskStatus,
    parseTaskPriority
} from '../tasks.types';
import { Subject, takeUntil } from 'rxjs';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact } from '../../contacts/contacts.types';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';
import { UserService } from 'app/core/user/user.service';
import { TeamMember } from 'app/core/user/user.types';

interface TaskDialogData {
    mode: 'create' | 'edit';
    taskId?: string;
    defaultStatus?: TaskStatus;
    defaultScheduledDate?: Date;
}

type AssignmentType = 'none' | 'contact' | 'property';

@Component({
    selector: 'tasks-dialog',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './task-dialog.component.html',
    styleUrls: ['./task-dialog.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatFormFieldModule,
        MatProgressSpinnerModule
    ]
})
export class TaskDialogComponent implements OnInit, OnDestroy {
    form: FormGroup;
    mode: 'create' | 'edit';
    taskId?: string;

    priorities = [
        { value: TaskPriority.Low, label: getTaskPriorityLabel(TaskPriority.Low), color: 'emerald' },
        { value: TaskPriority.Medium, label: getTaskPriorityLabel(TaskPriority.Medium), color: 'sky' },
        { value: TaskPriority.High, label: getTaskPriorityLabel(TaskPriority.High), color: 'amber' },
        { value: TaskPriority.Critical, label: getTaskPriorityLabel(TaskPriority.Critical), color: 'rose' }
    ];


    assignmentType: AssignmentType = 'none';
    contacts: Contact[] = [];
    filteredContacts: Contact[] = [];
    contactSearchTerm: string = '';
    showContactDropdown: boolean = false;
    isEditingContact: boolean = false;

    properties: Property[] = [];
    filteredProperties: Property[] = [];
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;

    teamMembers: TeamMember[] = [];

    isSaving: boolean = false;
    isLoadingTask: boolean = false;

    minDate: Date = new Date();
    formFieldHelpers: string[] = [''];

    private _unsubscribeAll: Subject<void> = new Subject<void>();
    private _tasksService = inject(TasksService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _contactsService = inject(ContactsService);
    private _propertyService = inject(PropertyService);
    private _userService = inject(UserService);
    private _formBuilder = inject(FormBuilder);

    constructor(
        private _dialogRef: MatDialogRef<TaskDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: TaskDialogData
    ) {
        this.mode = _data.mode;
        this.taskId = _data.taskId;

        const scheduledDate = _data.defaultScheduledDate ? new Date(_data.defaultScheduledDate) : new Date();

        this.form = this._formBuilder.group({
            title: ['', [Validators.required, Validators.maxLength(150)]],
            description: ['', [Validators.maxLength(5000)]],
            status: [TaskStatus.ToDo], // Always set to ToDo, hidden from UI
            priority: [TaskPriority.Medium, Validators.required],
            scheduledDate: [scheduledDate, Validators.required],
            assignedUserId: [null, Validators.required],
            assignmentType: ['none' as AssignmentType],
            contactId: [null],
            propertyId: [null]
        });
    }

    ngOnInit(): void {
        this.loadContacts();
        this.loadProperties();
        this.loadTeamMembers();

        if (this.mode === 'edit' && this.taskId) {
            this.loadTask(this.taskId);
        }

        this.form.get('assignmentType')?.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((type: AssignmentType) => {
                this.assignmentType = type;
                if (type !== 'contact') {
                    this.form.patchValue({ contactId: null }, { emitEvent: false });
                    this.contactSearchTerm = '';
                    this.isEditingContact = false;
                    this.showContactDropdown = false;
                }
                if (type !== 'property') {
                    this.form.patchValue({ propertyId: null }, { emitEvent: false });
                    this.propertySearchTerm = '';
                    this.isEditingProperty = false;
                    this.showPropertyDropdown = false;
                }
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._errorHandlerService.showErrorAlert('Validation', 'Please fill in the required fields before saving the task.');
            return;
        }

        const assignmentType: AssignmentType = this.form.get('assignmentType')?.value;
        if (assignmentType === 'contact' && !this.form.get('contactId')?.value) {
            this._errorHandlerService.showErrorAlert('Validation', 'Please select a contact to link this task.');
            return;
        }

        if (assignmentType === 'property' && !this.form.get('propertyId')?.value) {
            this._errorHandlerService.showErrorAlert('Validation', 'Please select a property to link this task.');
            return;
        }

        this.isSaving = true;
        this._changeDetectorRef.markForCheck();

        const payload = this.buildPayload();

        const request$ = this.mode === 'create'
            ? this._tasksService.createTask(payload as CreateTaskDto)
            : this._tasksService.updateTask(this.taskId!, payload as UpdateTaskDto);

        request$.subscribe({
            next: () => {
                const message = this.mode === 'create' ? 'Task created successfully' : 'Task updated successfully';
                this._errorHandlerService.showSuccessAlert('Success', message);
                this.isSaving = false;
                this._dialogRef.close(true);
            },
            error: (error) => {
                console.error('Error saving task', error);
                this.isSaving = false;
                this._errorHandlerService.showErrorAlert('Error', 'Failed to save task. Please try again.');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    close(): void {
        this._dialogRef.close(false);
    }

    private loadContacts(): void {
        this._contactsService.getContacts({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: ''
        }).subscribe({
            next: (response) => {
                this.contacts = response.result ?? [];
                this.filteredContacts = [...this.contacts];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading contacts', error);
                this.contacts = [];
                this.filteredContacts = [];
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    private loadProperties(): void {
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: ''
        }).subscribe({
            next: (response) => {
                this.properties = response.result ?? [];
                this.filteredProperties = [...this.properties];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading properties', error);
                this.properties = [];
                this.filteredProperties = [];
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    private loadTeamMembers(): void {
        this._userService.getTeamMembers().subscribe({
            next: (response) => {
                if (response.success) {
                    this.teamMembers = response.data ?? [];
                } else {
                    this.teamMembers = [];
                }
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading team members', error);
                this.teamMembers = [];
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    private loadTask(taskId: string): void {
        this.isLoadingTask = true;
        this._changeDetectorRef.markForCheck();

        this._tasksService.getTaskById(taskId).subscribe({
            next: (task: Task) => {
                this.isLoadingTask = false;
                this.populateForm(task);
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading task', error);
                this.isLoadingTask = false;
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load task details');
                this._dialogRef.close(false);
            }
        });
    }

    private populateForm(task: Task): void {
        const scheduledDateTime = task.scheduledDateTime ? new Date(task.scheduledDateTime) : new Date();

        const assignmentType: AssignmentType =
            task.contactId ? 'contact' :
            task.propertyId ? 'property' :
            'none';

        // Convert string enum values from API to numeric enum values
        const priority = parseTaskPriority(task.priority ?? TaskPriority.Medium);
        const status = parseTaskStatus(task.status ?? TaskStatus.ToDo);

        // Use setValue for priority to ensure mat-select properly recognizes the value
        this.form.patchValue({
            title: task.title,
            description: task.description ?? '',
            status: status, // Converted to numeric enum
            scheduledDate: scheduledDateTime,
            assignedUserId: task.assignedUserId ?? null,
            assignmentType: assignmentType,
            contactId: task.contactId ?? null,
            propertyId: task.propertyId ?? null
        }, { emitEvent: false });
        
        // Set priority separately to ensure proper selection
        this.form.get('priority')?.setValue(priority, { emitEvent: false });

        this.assignmentType = assignmentType;
        
        // Initialize filtered arrays
        this.filteredContacts = [...this.contacts];
        this.filteredProperties = [...this.properties];
        
        // Reset search states
        this.contactSearchTerm = '';
        this.propertySearchTerm = '';
        this.isEditingContact = false;
        this.isEditingProperty = false;
        this.showContactDropdown = false;
        this.showPropertyDropdown = false;
    }

    private buildPayload(): CreateTaskDto | UpdateTaskDto {
        const formValue = this.form.value;
        const scheduledDate: Date = formValue.scheduledDate;

        // Set time to start of day (00:00:00)
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(0, 0, 0, 0);

        const payload: CreateTaskDto = {
            title: formValue.title,
            description: formValue.description,
            status: this.mode === 'create' ? TaskStatus.ToDo : formValue.status, // Always ToDo for new tasks
            priority: formValue.priority,
            scheduledDateTime: scheduledDateTime.toISOString(),
            assignedUserId: formValue.assignedUserId || null,
            contactId: formValue.assignmentType === 'contact' ? formValue.contactId : null,
            propertyId: formValue.assignmentType === 'property' ? formValue.propertyId : null
        };

        return payload;
    }

    /**
     * Compare function for mat-select to properly match values
     */
    compareValues(v1: any, v2: any): boolean {
        return Number(v1) === Number(v2);
    }

    // Contact search and selection methods
    onContactInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.contactSearchTerm = value;
        this.isEditingContact = true;

        const term = value.toLowerCase().trim();
        if (!term) {
            this.filteredContacts = [...this.contacts];
        } else {
            this.filteredContacts = this.contacts.filter(contact => {
                const name = contact.isACompany ? contact.companyName : `${contact.firstName} ${contact.lastName}`;
                return (name ?? '').toLowerCase().includes(term) || (contact.email ?? '').toLowerCase().includes(term);
            });
        }
        this.showContactDropdown = true;
        this._changeDetectorRef.markForCheck();
    }

    onContactFocus(): void {
        this.isEditingContact = true;
        this.showContactDropdown = true;
        this.filteredContacts = [...this.contacts];
        this._changeDetectorRef.markForCheck();
    }

    onContactBlur(): void {
        setTimeout(() => {
            this.showContactDropdown = false;
            this.isEditingContact = false;
            this.contactSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectContact(contactId: string): void {
        this.form.patchValue({ contactId: contactId });
        this.contactSearchTerm = '';
        this.isEditingContact = false;
        this.showContactDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearContactSelection(): void {
        this.form.patchValue({ contactId: null });
        this.contactSearchTerm = '';
        this.isEditingContact = false;
        this.showContactDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    getSelectedContactName(): string {
        const contactId = this.form.get('contactId')?.value;
        if (!contactId) {
            return '';
        }
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact) {
            return '';
        }
        return contact.isACompany ? contact.companyName : `${contact.firstName} ${contact.lastName}`;
    }

    // Property search and selection methods
    onPropertyInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.propertySearchTerm = value;
        this.isEditingProperty = true;

        const term = value.toLowerCase().trim();
        if (!term) {
            this.filteredProperties = [...this.properties];
        } else {
            this.filteredProperties = this.properties.filter(property => {
                const name = property.name ?? property.identifier ?? '';
                const address = property.address ?? '';
                return name.toLowerCase().includes(term) || address.toLowerCase().includes(term);
            });
        }
        this.showPropertyDropdown = true;
        this._changeDetectorRef.markForCheck();
    }

    onPropertyFocus(): void {
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filteredProperties = [...this.properties];
        this._changeDetectorRef.markForCheck();
    }

    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            this.propertySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectProperty(propertyId: string): void {
        this.form.patchValue({ propertyId: propertyId });
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    clearPropertySelection(): void {
        this.form.patchValue({ propertyId: null });
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this._changeDetectorRef.markForCheck();
    }

    getSelectedPropertyName(): string {
        const propertyId = this.form.get('propertyId')?.value;
        if (!propertyId) {
            return '';
        }
        const property = this.properties.find(p => p.id === propertyId);
        return property ? (property.name ?? property.identifier ?? 'Property') : '';
    }
}


