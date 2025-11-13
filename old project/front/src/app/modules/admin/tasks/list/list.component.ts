import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { TasksService } from '../tasks.service';
import {
    GetTasksFilter,
    Task,
    TaskStatus,
    getTaskPriorityLabel,
    getTaskStatusColor,
    getTaskStatusLabel,
    parseTaskStatus
} from '../tasks.types';
import { TaskDialogComponent } from '../dialog/task-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { TeamMember } from 'app/core/user/user.types';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact } from '../../contacts/contacts.types';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';

interface KanbanColumn {
    status: TaskStatus;
    title: string;
    description: string;
    tasks: Task[];
    icon: string;
}

@Component({
    selector: 'tasks-list',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatButtonToggleModule,
        DragDropModule,
        CdkDropListGroup,
        MatProgressBarModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    styleUrls: ['./list.component.scss'],
    templateUrl: './list.component.html'
})
export class TasksListComponent implements OnInit, OnDestroy {
    tasks: Task[] = [];
    filteredTasks: Task[] = [];
    columns: KanbanColumn[] = [];

    isLoading: boolean = false;

    currentMonthDate: Date = new Date();
    currentMonthLabel: string = '';
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    teamMembers: TeamMember[] = [];
    filteredTeamMembers: TeamMember[] = [];
    selectedUserId: string | null = null;
    userSearchTerm: string = '';
    showUserDropdown: boolean = false;
    isEditingUser: boolean = false;

    contacts: Contact[] = [];
    filteredContacts: Contact[] = [];
    selectedContactId: string | null = null;
    contactSearchTerm: string = '';
    showContactDropdown: boolean = false;
    isEditingContact: boolean = false;

    properties: Property[] = [];
    filteredProperties: Property[] = [];
    selectedPropertyId: string | null = null;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;

    private _tasksService = inject(TasksService);
    private _dialog = inject(MatDialog);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _confirmationService = inject(FuseConfirmationService);
    private _userService = inject(UserService);
    private _contactsService = inject(ContactsService);
    private _propertyService = inject(PropertyService);

    getTaskStatusLabel = getTaskStatusLabel;
    getTaskStatusColor = getTaskStatusColor;
    getTaskPriorityLabel = getTaskPriorityLabel;

    getIconContainerClass(status: TaskStatus | string): string {
        const color = getTaskStatusColor(status);
        return `bg-${color}-500`;
    }

    ngOnInit(): void {
        this.updateMonthLabel();
        this.loadTeamMembers();
        this.loadContacts();
        this.loadProperties();
        this.loadTasks();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    previousMonth(): void {
        const previous = new Date(this.currentMonthDate);
        previous.setMonth(previous.getMonth() - 1);
        this.currentMonthDate = previous;
        this.updateMonthLabel();
        this.loadTasks();
    }

    nextMonth(): void {
        const next = new Date(this.currentMonthDate);
        next.setMonth(next.getMonth() + 1);
        this.currentMonthDate = next;
        this.updateMonthLabel();
        this.loadTasks();
    }

    openCreateTaskDialog(status: TaskStatus = TaskStatus.ToDo): void {
        const dialogRef = this._dialog.open(TaskDialogComponent, {
            width: '880px',
            maxWidth: '95vw',
            data: {
                mode: 'create',
                defaultStatus: status,
                defaultScheduledDate: this.currentMonthDate
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTasks();
            }
        });
    }

    openEditTaskDialog(task: Task): void {
        const dialogRef = this._dialog.open(TaskDialogComponent, {
            width: '880px',
            maxWidth: '95vw',
            data: {
                mode: 'edit',
                taskId: task.id
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTasks();
            }
        });
    }

    deleteTask(task: Task): void {
        const confirmation = this._confirmationService.open({
            title: 'Delete Task',
            message: `Are you sure you want to delete "${task.title}"?`,
            actions: {
                confirm: {
                    color: 'warn',
                    label: 'Delete'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._tasksService.deleteTask(task.id).subscribe({
                    next: (isSuccess) => {
                        if (isSuccess) {
                            this._errorHandlerService.showSuccessAlert('Success', 'Task deleted successfully');
                            this.loadTasks();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting task', error);
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete task');
                    }
                });
            }
        });
    }

    drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
        const previousList = event.previousContainer.data;
        const currentList = event.container.data;

        if (event.previousContainer === event.container) {
            // Reordering within the same column
            moveItemInArray(currentList, event.previousIndex, event.currentIndex);
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                this._changeDetectorRef.markForCheck();
            });
        } else {
            // Moving between columns
            const movedTask = previousList[event.previousIndex];
            const currentTaskStatus = parseTaskStatus(movedTask.status);
            
            if (currentTaskStatus !== targetStatus) {
                // Update the task status in the main tasks array
                const taskInMainArray = this.tasks.find(t => t.id === movedTask.id);
                const originalStatus = taskInMainArray ? taskInMainArray.status : movedTask.status;
                
                if (taskInMainArray) {
                    taskInMainArray.status = targetStatus;
                }
                movedTask.status = targetStatus;
                
                // Transfer the item visually - this happens synchronously for immediate feedback
                transferArrayItem(previousList, currentList, event.previousIndex, event.currentIndex);
                
                // Use requestAnimationFrame for smoother change detection
                requestAnimationFrame(() => {
                    this._changeDetectorRef.markForCheck();
                });
                
                // Update status on backend asynchronously (non-blocking)
                this._tasksService.updateTaskStatus(movedTask.id, targetStatus).subscribe({
                    next: () => {
                        // Task is already visually in the correct column, no need to rebuild
                    },
                    error: (error) => {
                        console.error('Error updating task status', error);
                        this._errorHandlerService.showErrorAlert('Error', 'Unable to update task status');
                        // Revert the change in main array
                        if (taskInMainArray) {
                            taskInMainArray.status = originalStatus;
                        }
                        movedTask.status = originalStatus;
                        // Revert visual transfer - move back to original column
                        transferArrayItem(currentList, previousList, event.currentIndex, event.previousIndex);
                        requestAnimationFrame(() => {
                            this._changeDetectorRef.markForCheck();
                        });
                    }
                });
            } else {
                // Status already matches, just transfer
                transferArrayItem(previousList, currentList, event.previousIndex, event.currentIndex);
                requestAnimationFrame(() => {
                    this._changeDetectorRef.markForCheck();
                });
            }
        }
    }

    trackByTaskId(index: number, item: Task): string {
        return item.id;
    }

    private loadTasks(): void {
        const filter: GetTasksFilter = {
            month: this.currentMonthDate.getMonth() + 1,
            year: this.currentMonthDate.getFullYear(),
            assignedUserId: this.selectedUserId || undefined,
            contactId: this.selectedContactId || undefined,
            propertyId: this.selectedPropertyId || undefined
        };

        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._tasksService.getTasks(filter).subscribe({
            next: (result) => {
                this.tasks = result.result || [];
                this.applyFilters();
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading tasks', error);
                this.isLoading = false;
                this.tasks = [];
                this.filteredTasks = [];
                this.columns = this.buildColumns();
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load tasks');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    private applyFilters(rebuildColumns: boolean = true): void {
        this.filteredTasks = [...this.tasks];

        if (rebuildColumns) {
            this.columns = this.buildColumns();
        }
        this._changeDetectorRef.markForCheck();
    }

    private buildColumns(): KanbanColumn[] {
        const grouped = {
            [TaskStatus.ToDo]: [] as Task[],
            [TaskStatus.InProgress]: [] as Task[],
            [TaskStatus.Completed]: [] as Task[]
        };

        this.filteredTasks.forEach((task) => {
            // Normalize status from string to enum value
            const normalizedStatus = parseTaskStatus(task.status);
            grouped[normalizedStatus]?.push(task);
        });

        return [
            {
                status: TaskStatus.ToDo,
                title: 'To Do',
                description: 'Planned tasks waiting to be started',
                tasks: grouped[TaskStatus.ToDo] ?? [],
                icon: 'heroicons_outline:clipboard-document-check'
            },
            {
                status: TaskStatus.InProgress,
                title: 'In Progress',
                description: 'Tasks currently being worked on',
                tasks: grouped[TaskStatus.InProgress] ?? [],
                icon: 'heroicons_outline:bolt'
            },
            {
                status: TaskStatus.Completed,
                title: 'Completed',
                description: 'Finished tasks for the selected month',
                tasks: grouped[TaskStatus.Completed] ?? [],
                icon: 'heroicons_outline:check-badge'
            }
        ];
    }

    private updateMonthLabel(): void {
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
        this.currentMonthLabel = formatter.format(this.currentMonthDate);
    }

    private loadTeamMembers(): void {
        this._userService.getTeamMembers().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (response) => {
                if (response.success) {
                    this.teamMembers = response.data ?? [];
                    this.filteredTeamMembers = [...this.teamMembers];
                } else {
                    this.teamMembers = [];
                    this.filteredTeamMembers = [];
                }
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading team members', error);
                this.teamMembers = [];
                this.filteredTeamMembers = [];
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    private loadContacts(): void {
        this._contactsService.getContacts({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: ''
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (result) => {
                this.contacts = result.result ?? [];
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
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (result) => {
                this.properties = result.result ?? [];
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

    onUserInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.userSearchTerm = value;
        this.isEditingUser = true;

        const term = value.toLowerCase().trim();
        if (!term) {
            this.filteredTeamMembers = [...this.teamMembers];
        } else {
            this.filteredTeamMembers = this.teamMembers.filter(member =>
                member.name.toLowerCase().includes(term) || member.email?.toLowerCase().includes(term)
            );
        }
        this.showUserDropdown = true;
    }

    onUserFocus(): void {
        this.isEditingUser = true;
        this.showUserDropdown = true;
        this.filteredTeamMembers = [...this.teamMembers];
    }

    onUserBlur(): void {
        setTimeout(() => {
            this.showUserDropdown = false;
            this.isEditingUser = false;
            this.userSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectUser(userId: string | null): void {
        this.selectedUserId = userId;
        this.userSearchTerm = '';
        this.isEditingUser = false;
        this.showUserDropdown = false;
        this.loadTasks();
        this._changeDetectorRef.markForCheck();
    }

    clearUserFilter(): void {
        if (this.selectedUserId !== null) {
            this.selectUser(null);
        }
    }

    getSelectedUserName(): string {
        if (!this.selectedUserId) {
            return 'All Users';
        }
        const member = this.teamMembers.find(m => m.id === this.selectedUserId);
        return member ? member.name : 'All Users';
    }

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
    }

    onContactFocus(): void {
        this.isEditingContact = true;
        this.showContactDropdown = true;
        this.filteredContacts = [...this.contacts];
    }

    onContactBlur(): void {
        setTimeout(() => {
            this.showContactDropdown = false;
            this.isEditingContact = false;
            this.contactSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectContact(contactId: string | null): void {
        this.selectedContactId = contactId;
        this.contactSearchTerm = '';
        this.isEditingContact = false;
        this.showContactDropdown = false;
        this.loadTasks();
        this._changeDetectorRef.markForCheck();
    }

    clearContactFilter(): void {
        if (this.selectedContactId !== null) {
            this.selectContact(null);
        }
    }

    getSelectedContactName(): string {
        if (!this.selectedContactId) {
            return 'All Contacts';
        }
        const contact = this.contacts.find(c => c.id === this.selectedContactId);
        if (!contact) {
            return 'All Contacts';
        }
        return contact.isACompany ? contact.companyName : `${contact.firstName} ${contact.lastName}`;
    }

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
    }

    onPropertyFocus(): void {
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filteredProperties = [...this.properties];
    }

    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            this.propertySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    selectProperty(propertyId: string | null): void {
        this.selectedPropertyId = propertyId;
        this.propertySearchTerm = '';
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this.loadTasks();
        this._changeDetectorRef.markForCheck();
    }

    clearPropertyFilter(): void {
        if (this.selectedPropertyId !== null) {
            this.selectProperty(null);
        }
    }

    getSelectedPropertyName(): string {
        if (!this.selectedPropertyId) {
            return 'All Properties';
        }
        const property = this.properties.find(p => p.id === this.selectedPropertyId);
        return property ? (property.name ?? property.identifier ?? 'Property') : 'All Properties';
    }
}


