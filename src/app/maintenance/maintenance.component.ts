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
      id: 'backlog',
      title: 'Backlog',
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
    
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: true, // Get all maintenances
    };

    this.maintenanceService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.maintenances.set(response.result);
        this.updateKanbanColumns(response.result);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading maintenances:', error);
        this.toastService.error('Failed to load maintenances');
        this.isLoading.set(false);
      },
    });
  }

  updateKanbanColumns(maintenances: Maintenance[]): void {
    const backlog: KanbanTask[] = [];
    const inProgress: KanbanTask[] = [];
    const done: KanbanTask[] = [];

    maintenances.forEach((maintenance) => {
      const task: KanbanTask = {
        id: maintenance.id,
        title: maintenance.subject,
        description: maintenance.description,
        priority: this.mapPriorityToKanban(maintenance.priority),
        progress: this.calculateProgress(maintenance.status),
        assignedUsers: maintenance.contactName ? [{
          fallback: this.getInitials(maintenance.contactName),
        }] : undefined,
        dateRange: this.formatDateRange(maintenance.scheduledDateTime),
      };

      switch (maintenance.status) {
        case MaintenanceStatus.Waiting:
          backlog.push(task);
          break;
        case MaintenanceStatus.InProgress:
          inProgress.push(task);
          break;
        case MaintenanceStatus.Done:
          done.push(task);
          break;
        case MaintenanceStatus.Cancelled:
          // Cancelled items can go to backlog or be filtered out
          break;
      }
    });

    this.kanbanColumns.set([
      {
        id: 'backlog',
        title: 'Backlog',
        status: 'planned',
        tasks: backlog,
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        status: 'in-progress',
        tasks: inProgress,
      },
      {
        id: 'done',
        title: 'Done',
        status: 'done',
        tasks: done,
      },
    ]);
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

  getStatusLabel(status: MaintenanceStatus): string {
    switch (status) {
      case MaintenanceStatus.Waiting:
        return 'Waiting';
      case MaintenanceStatus.InProgress:
        return 'In Progress';
      case MaintenanceStatus.Done:
        return 'Done';
      case MaintenanceStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Waiting';
    }
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


  onTaskDropped(event: { taskId: string; newStatus: 'planned' | 'in-progress' | 'done'; previousStatus: 'planned' | 'in-progress' | 'done' }): void {
    const newMaintenanceStatus = this.mapKanbanStatusToMaintenanceStatus(event.newStatus);
    
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

    // Poll for result
    let checkInterval: any = null;
    let attempts = 0;
    const maxAttempts = 60; // 6 seconds

    checkInterval = setInterval(() => {
      attempts++;
      const result = (dialogRef as any)?.getResult?.();
      
      if (result && result.maintenanceId) {
        clearInterval(checkInterval);
        this.toastService.success('Maintenance created successfully');
        this.loadMaintenances();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);
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

    // Poll for result
    let checkInterval: any = null;
    let attempts = 0;
    const maxAttempts = 60; // 6 seconds

    checkInterval = setInterval(() => {
      attempts++;
      const result = (dialogRef as any)?.getResult?.();
      
      if (result && result.maintenanceId) {
        clearInterval(checkInterval);
        this.toastService.success('Maintenance updated successfully');
        this.loadMaintenances();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);
  }
}
