import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../page/page.component';
import { ZardKanbanComponent, KanbanColumn, KanbanTask } from '@shared/components/kanban/kanban.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { MaintenanceService } from '@shared/services/maintenance.service';
import { ToastService } from '@shared/services/toast.service';
import { EditMaintenanceComponent } from './edit/edit-maintenance.component';
import type { Maintenance } from '@shared/models/maintenance/maintenance.model';
import { MaintenanceStatus, MaintenancePriority } from '@shared/models/maintenance/maintenance.model';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    ZardPageComponent,
    ZardKanbanComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  templateUrl: './maintenance.component.html',
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  readonly currentDate = signal<Date>(new Date());
  readonly isLoading = signal(false);
  readonly maintenances = signal<Maintenance[]>([]);

  readonly currentMonth = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long' });
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  readonly monthYearDisplay = computed(() => {
    return `${this.currentMonth()} ${this.currentYear()}`;
  });

  // Kanban columns
  readonly kanbanColumns = signal<KanbanColumn[]>([
    {
      id: 'waiting',
      title: 'Waiting',
      status: 'planned',
      tasks: [],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      tasks: [],
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      tasks: [],
    },
    {
      id: 'cancelled',
      title: 'Cancelled',
      status: 'planned',
      tasks: [],
    },
  ]);

  ngOnInit(): void {
    this.loadMaintenances();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMaintenances(): void {
    this.isLoading.set(true);
    
    // Calculate start and end dates for the selected month
    const currentDate = this.currentDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Start date: first day of the month at 00:00:00
    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    
    // End date: last day of the month at 23:59:59
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true, // Get all maintenances
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    this.maintenanceService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.maintenances.set(response.result);
        
        // Update kanban columns with the loaded data (contact avatars are now included in the response)
        if (response.result && response.result.length > 0) {
          this.updateKanbanColumns(response.result);
        } else {
          // Reset to empty columns if no data
          this.updateKanbanColumns([]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading maintenances:', error);
        this.toastService.error('Failed to load maintenances');
        this.isLoading.set(false);
        // Reset columns on error
        this.updateKanbanColumns([]);
      },
    });
  }

  updateKanbanColumns(maintenances: Maintenance[]): void {
    const waiting: KanbanTask[] = [];
    const inProgress: KanbanTask[] = [];
    const done: KanbanTask[] = [];
    const cancelled: KanbanTask[] = [];

    maintenances.forEach((maintenance) => {
      // Get contact avatar URL directly from maintenance (now included in API response)
      const contactAvatarUrl = maintenance.contactImageUrl || null;
      
      // Backend now returns priority as number directly
      const priority = maintenance.priority as MaintenancePriority;
      
      const task: KanbanTask = {
        id: maintenance.id,
        title: maintenance.subject,
        description: maintenance.description,
        priority: this.mapPriorityToKanban(priority),
        // Removed progress
        assignedUsers: maintenance.contactName ? [{
          fallback: this.getInitials(maintenance.contactName),
          url: contactAvatarUrl || undefined,
        }] : undefined,
        dateRange: this.formatDateRange(maintenance.scheduledDateTime),
        // Property information (combined in one item)
        propertyName: maintenance.propertyName,
        propertyAddress: maintenance.propertyAddress,
        propertyImageUrl: maintenance.propertyImageUrl,
        // Only use propertyIdentifier if it exists and is not empty, otherwise don't show reference (don't fallback to GUID)
        propertyReference: maintenance.propertyIdentifier && maintenance.propertyIdentifier.trim() !== '' 
          ? maintenance.propertyIdentifier 
          : undefined,
        // Service/Contact information
        serviceName: maintenance.contactName,
        serviceAvatarUrl: contactAvatarUrl || undefined,
      };

      // Backend now returns status as number directly
      const status = maintenance.status as MaintenanceStatus;
      
      switch (status) {
        case MaintenanceStatus.Waiting:
          waiting.push(task);
          break;
        case MaintenanceStatus.InProgress:
          inProgress.push(task);
          break;
        case MaintenanceStatus.Done:
          done.push(task);
          break;
        case MaintenanceStatus.Cancelled:
          cancelled.push(task);
          break;
        default:
          // Default to waiting if status is unknown
          waiting.push(task);
          break;
      }
    });


    // Update columns with new tasks - create completely new objects to trigger change detection
    const newColumns: KanbanColumn[] = [
      {
        id: 'waiting',
        title: 'Waiting',
        status: 'planned',
        tasks: waiting.map(t => ({ ...t })), // Deep copy tasks
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        status: 'in-progress',
        tasks: inProgress.map(t => ({ ...t })), // Deep copy tasks
      },
      {
        id: 'done',
        title: 'Done',
        status: 'done',
        tasks: done.map(t => ({ ...t })), // Deep copy tasks
      },
      {
        id: 'cancelled',
        title: 'Cancelled',
        status: 'planned',
        tasks: cancelled.map(t => ({ ...t })), // Deep copy tasks
      },
    ];
    
    this.kanbanColumns.set(newColumns);
  }

  mapPriorityToKanban(priority: MaintenancePriority): 'High' | 'Medium' | 'Low' {
    switch (priority) {
      case MaintenancePriority.Urgent:
        return 'High';
      case MaintenancePriority.Medium:
        return 'Medium';
      case MaintenancePriority.Low:
        return 'Low';
      default:
        return 'Medium';
    }
  }

  mapKanbanStatusToMaintenanceStatus(status: 'planned' | 'in-progress' | 'done'): MaintenanceStatus {
    switch (status) {
      case 'planned':
        return MaintenanceStatus.Waiting;
      case 'in-progress':
        return MaintenanceStatus.InProgress;
      case 'done':
        return MaintenanceStatus.Done;
      default:
        return MaintenanceStatus.Waiting;
    }
  }

  mapKanbanColumnIdToMaintenanceStatus(columnId: string): MaintenanceStatus {
    switch (columnId) {
      case 'waiting':
      case 'backlog': // Support old column ID for backward compatibility
        return MaintenanceStatus.Waiting;
      case 'in-progress':
        return MaintenanceStatus.InProgress;
      case 'done':
        return MaintenanceStatus.Done;
      case 'cancelled':
        return MaintenanceStatus.Cancelled;
      default:
        return MaintenanceStatus.Waiting;
    }
  }

  calculateProgress(status: MaintenanceStatus): number {
    switch (status) {
      case MaintenanceStatus.Waiting:
        return 0;
      case MaintenanceStatus.InProgress:
        return 50;
      case MaintenanceStatus.Done:
        return 100;
      case MaintenanceStatus.Cancelled:
        return 0;
      default:
        return 0;
    }
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDateRange(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onStatusChange(maintenanceId: string, newStatusValue: string): void {
    const newStatus = parseInt(newStatusValue, 10) as MaintenanceStatus;
    
    this.maintenanceService.updateStatus(maintenanceId, newStatus).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success('Maintenance status updated');
        // Reload to ensure consistency
        this.loadMaintenances();
      },
      error: (error) => {
        console.error('Error updating maintenance status:', error);
        this.toastService.error('Failed to update maintenance status');
        // Reload to revert UI changes
        this.loadMaintenances();
      },
    });
  }

  getPriorityLabel(priority: MaintenancePriority): string {
    switch (priority) {
      case MaintenancePriority.Urgent:
        return 'Urgent';
      case MaintenancePriority.Medium:
        return 'Medium';
      case MaintenancePriority.Low:
        return 'Low';
      default:
        return 'Medium';
    }
  }

  // Status options with icons (matching edit component)
  readonly statusOptions = [
    { value: String(MaintenanceStatus.Waiting), label: 'Waiting', icon: 'loader-circle' as const },
    { value: String(MaintenanceStatus.InProgress), label: 'In Progress', icon: 'refresh-cw' as const },
    { value: String(MaintenanceStatus.Done), label: 'Done', icon: 'check' as const },
    { value: String(MaintenanceStatus.Cancelled), label: 'Cancelled', icon: 'x' as const },
  ];

  getStatusValue(status: MaintenanceStatus | string): string {
    // Convert status to number if it's a string
    let statusNum: MaintenanceStatus;
    if (typeof status === 'string') {
      const statusMap: Record<string, MaintenanceStatus> = {
        'Waiting': MaintenanceStatus.Waiting,
        'InProgress': MaintenanceStatus.InProgress,
        'Done': MaintenanceStatus.Done,
        'Cancelled': MaintenanceStatus.Cancelled,
      };
      statusNum = statusMap[status] || parseInt(status, 10) || MaintenanceStatus.Waiting;
    } else {
      statusNum = status;
    }
    return statusNum.toString();
  }

  getStatusLabel(status: MaintenanceStatus | string): string {
    // Convert status to number if it's a string
    let statusNum: MaintenanceStatus;
    if (typeof status === 'string') {
      const statusMap: Record<string, MaintenanceStatus> = {
        'Waiting': MaintenanceStatus.Waiting,
        'InProgress': MaintenanceStatus.InProgress,
        'Done': MaintenanceStatus.Done,
        'Cancelled': MaintenanceStatus.Cancelled,
      };
      statusNum = statusMap[status] || parseInt(status, 10) || MaintenanceStatus.Waiting;
    } else {
      statusNum = status;
    }
    
    const option = this.statusOptions.find(opt => Number(opt.value) === statusNum);
    return option?.label || 'Waiting';
  }

  getSelectedStatusIcon(status: MaintenanceStatus | string): 'loader-circle' | 'refresh-cw' | 'check' | 'x' {
    // Convert status to number if it's a string
    let statusNum: MaintenanceStatus;
    if (typeof status === 'string') {
      const statusMap: Record<string, MaintenanceStatus> = {
        'Waiting': MaintenanceStatus.Waiting,
        'InProgress': MaintenanceStatus.InProgress,
        'Done': MaintenanceStatus.Done,
        'Cancelled': MaintenanceStatus.Cancelled,
      };
      statusNum = statusMap[status] || parseInt(status, 10) || MaintenanceStatus.Waiting;
    } else {
      statusNum = status;
    }
    
    const option = this.statusOptions.find(opt => Number(opt.value) === statusNum);
    return (option?.icon || 'loader-circle') as 'loader-circle' | 'refresh-cw' | 'check' | 'x';
  }

  goToPreviousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
    this.loadMaintenances();
  }

  goToNextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
    this.loadMaintenances();
  }


  onTaskDropped(event: { taskId: string; newStatus: 'planned' | 'in-progress' | 'done'; previousStatus: 'planned' | 'in-progress' | 'done'; newColumnId?: string; previousColumnId?: string }): void {
    // Map column ID to maintenance status (handles cancelled column which also has status 'planned')
    let newMaintenanceStatus: MaintenanceStatus;
    
    if (event.newColumnId) {
      // Use column ID from event to get the correct status (handles cancelled vs waiting)
      newMaintenanceStatus = this.mapKanbanColumnIdToMaintenanceStatus(event.newColumnId);
    } else {
      // Fallback: use the event's newStatus
      // If newStatus is 'planned', we need to check if it's waiting or cancelled
      // Since we can't determine from status alone, default to waiting
      if (event.newStatus === 'planned') {
        newMaintenanceStatus = MaintenanceStatus.Waiting;
      } else {
        newMaintenanceStatus = this.mapKanbanStatusToMaintenanceStatus(event.newStatus);
      }
    }
    
    // Send update to API
    this.maintenanceService.updateStatus(event.taskId, newMaintenanceStatus).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success('Maintenance status updated');
        // Reload to ensure consistency
        this.loadMaintenances();
      },
      error: (error) => {
        console.error('Error updating maintenance status:', error);
        this.toastService.error('Failed to update maintenance status');
        // Reload to revert UI changes
        this.loadMaintenances();
      },
    });
  }

  onTaskClicked(event: { taskId: string }): void {
    this.editMaintenance(event.taskId);
  }

  addNewMaintenance(): void {
    const dialogRef = this.dialogService.create({
      zContent: EditMaintenanceComponent,
      zTitle: 'New Maintenance',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: {},
      zHideFooter: true,
      zClosable: true,
    });

    // Subscribe to dialog close event
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result && result.maintenanceId) {
        // Reload maintenances to update the list and kanban
        this.loadMaintenances();
      }
    });
  }

  editMaintenance(maintenanceId: string): void {
    const dialogRef = this.dialogService.create({
      zContent: EditMaintenanceComponent,
      zTitle: 'Edit Maintenance',
      zWidth: '800px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { maintenanceId },
      zHideFooter: true,
      zClosable: true,
    });

    // Subscribe to dialog close event
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result && result.maintenanceId) {
        // Reload maintenances to update the list and kanban
        this.loadMaintenances();
      }
    });
  }

  // Handle image error - show fallback
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const fallback = img.nextElementSibling as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  }
}
