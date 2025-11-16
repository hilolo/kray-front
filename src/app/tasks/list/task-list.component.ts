import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewContainerRef, viewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ZardDatatableComponent, DatatableColumn } from '@shared/components/datatable/datatable.component';
import { ZardDropdownMenuComponent } from '@shared/components/dropdown/dropdown.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import type { ZardIcon } from '@shared/components/icon/icons';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Task, TaskStatus, TaskPriority } from '@shared/models/task/task.model';
import type { TaskListRequest } from '@shared/models/task/task-list-request.model';
import { TaskService } from '@shared/services/task.service';
import { RoutePreferencesService } from '@shared/services/route-preferences.service';
import { ZardDialogService } from '@shared/components/dialog/dialog.service';
import { EditTaskComponent } from '../edit/edit-task.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardDatatableComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    ZardPaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnDestroy {
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly preferencesService = inject(RoutePreferencesService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchInputSubject = new Subject<string>();

  readonly searchQuery = signal(''); // Actual search term sent to server
  readonly searchInput = signal(''); // Input field value (for two-way binding)
  readonly statusFilter = signal<TaskStatus | undefined>(undefined);
  readonly priorityFilter = signal<TaskPriority | undefined>(undefined);
  readonly selectedRows = signal<Set<string>>(new Set());
  readonly currentPage = signal(1);
  readonly pageSizeOptions = signal([10, 20, 50, 100]);
  readonly pageSize = signal(10); // Will be initialized from preferences in ngOnInit
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);

  // Template references for custom cells
  readonly titleCell = viewChild<TemplateRef<any>>('titleCell');
  readonly priorityCell = viewChild<TemplateRef<any>>('priorityCell');
  readonly statusCell = viewChild<TemplateRef<any>>('statusCell');
  readonly assignedUserCell = viewChild<TemplateRef<any>>('assignedUserCell');
  readonly scheduledDateCell = viewChild<TemplateRef<any>>('scheduledDateCell');
  readonly linkToCell = viewChild<TemplateRef<any>>('linkToCell');
  readonly actionsCell = viewChild<TemplateRef<any>>('actionsCell');

  // Template references for filter selects
  readonly statusSelectRef = viewChild<ZardSelectComponent>('statusSelectRef');
  readonly prioritySelectRef = viewChild<ZardSelectComponent>('prioritySelectRef');

  // Define columns for datatable
  readonly columns = computed<DatatableColumn<Task>[]>(() => [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      cellTemplate: this.titleCell(),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      cellTemplate: this.priorityCell(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      cellTemplate: this.statusCell(),
    },
    {
      key: 'assignedUser',
      label: 'Assigned To',
      sortable: true,
      cellTemplate: this.assignedUserCell(),
    },
    {
      key: 'scheduledDateTime',
      label: 'Scheduled Date',
      sortable: true,
      cellTemplate: this.scheduledDateCell(),
    },
    {
      key: 'linkTo',
      label: 'Link To',
      cellTemplate: this.linkToCell(),
    },
    {
      key: 'actions',
      label: '',
      width: '50px',
      cellTemplate: this.actionsCell(),
    },
  ]);

  // Since we're using server-side search, filteredTasks just returns tasks
  readonly filteredTasks = computed(() => {
    return this.tasks();
  });

  ngOnInit(): void {
    // Get route key for preferences (e.g., 'tasks/list')
    const routeKey = this.getRouteKey();
    
    // Load view type preference for this route
    const savedViewType = this.preferencesService.getViewType(routeKey);
    this.viewMode.set(savedViewType);
    
    // Load page size preference for this route
    const savedPageSize = this.preferencesService.getPageSize(routeKey);
    this.pageSize.set(savedPageSize);
    
    // Set up debounced search subscription
    this.searchInputSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only trigger if value actually changed
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const trimmedValue = value.trim();
        
        // Only search if 3+ characters, otherwise clear search
        if (trimmedValue.length >= 3) {
          this.performSearch(trimmedValue);
        } else if (trimmedValue.length === 0 && this.searchQuery()) {
          // Clear search if input is empty
          this.performSearch('');
        } else if (trimmedValue.length > 0 && trimmedValue.length < 3) {
          // If search term is less than 3 characters, clear the search query
          this.searchQuery.set('');
          this.currentPage.set(1);
          this.loadTasks();
        }
      });
    
    this.loadTasks();
  }

  /**
   * Get the route key for preferences storage
   */
  private getRouteKey(): string {
    return 'tasks/list';
  }

  loadTasks(): void {
    this.isLoading.set(true);
    const request: TaskListRequest = {
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
      ignore: false,
      ...(this.searchQuery() && this.searchQuery().trim() ? { searchQuery: this.searchQuery().trim() } : {}),
      ...(this.statusFilter() !== undefined ? { status: this.statusFilter() } : {}),
      ...(this.priorityFilter() !== undefined ? { priority: this.priorityFilter() } : {}),
    };
    
    this.taskService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.tasks.set(response.result);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
        // Ensure selection is cleared after data loads (forces datatable to reset)
        this.selectedRows.set(new Set());
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
        // Clear selection on error too
        this.selectedRows.set(new Set());
      },
    });
  }

  readonly hasActiveFilters = computed(() => {
    return this.searchQuery().trim().length > 0 || this.statusFilter() !== undefined || this.priorityFilter() !== undefined;
  });

  resetFilters(): void {
    // Clear search
    this.searchQuery.set('');
    this.searchInput.set('');
    this.currentPage.set(1);
    
    // Clear status filter
    this.statusFilter.set(undefined);
    
    // Clear priority filter
    this.priorityFilter.set(undefined);
    
    // Close any open select dropdowns
    setTimeout(() => {
      const statusSelect = this.statusSelectRef();
      if (statusSelect) {
        // Access the close method - it's a private method but we can call it via any
        (statusSelect as any).close?.();
      }
      const prioritySelect = this.prioritySelectRef();
      if (prioritySelect) {
        (prioritySelect as any).close?.();
      }
    }, 0);
    
    // Reload tasks
    this.loadTasks();
  }

  readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });

  readonly hasSelectedTasks = computed(() => {
    return this.selectedCount() > 0;
  });

  readonly emptyMessage = computed(() => {
    if (this.searchQuery() || this.statusFilter() !== undefined || this.priorityFilter() !== undefined) {
      return 'No tasks match your filters';
    }
    return 'No tasks available';
  });

  onStatusFilterChange(status: string): void {
    const statusValue = status === 'all' ? undefined : (Number.parseInt(status, 10) as TaskStatus);
    this.statusFilter.set(statusValue);
    this.currentPage.set(1);
    this.loadTasks();
  }

  getStatusFilterValue(): string {
    const status = this.statusFilter();
    return status !== undefined ? status.toString() : 'all';
  }

  getStatusFilterLabel(): string {
    const status = this.statusFilter();
    if (status === undefined) return 'All Statuses';
    return this.getStatusLabel(status);
  }

  getStatusFilterIcon(): ZardIcon {
    const status = this.statusFilter();
    if (status === undefined) return 'settings';
    switch (status) {
      case 1: return 'circle';
      case 2: return 'clock';
      case 3: return 'circle-check';
      default: return 'settings';
    }
  }

  onPriorityFilterChange(priority: string): void {
    const priorityValue = priority === 'all' ? undefined : (Number.parseInt(priority, 10) as TaskPriority);
    this.priorityFilter.set(priorityValue);
    this.currentPage.set(1);
    this.loadTasks();
  }

  getPriorityFilterValue(): string {
    const priority = this.priorityFilter();
    return priority !== undefined ? priority.toString() : 'all';
  }

  getPriorityFilterLabel(): string {
    const priority = this.priorityFilter();
    if (priority === undefined) return 'All Priorities';
    return this.getPriorityLabel(priority);
  }

  getPriorityFilterIcon(): ZardIcon {
    const priority = this.priorityFilter();
    if (priority === undefined) return 'settings';
    switch (priority) {
      case 1: return 'circle';
      case 2: return 'circle-check';
      case 3: return 'triangle-alert';
      case 4: return 'triangle-alert';
      default: return 'settings';
    }
  }

  readonly hasData = computed(() => {
    return this.filteredTasks().length > 0;
  });

  onSearchInputChange(value: string): void {
    // Update the input value
    this.searchInput.set(value);
    // Emit to subject for debounced search
    this.searchInputSubject.next(value);
  }

  /**
   * Perform search with the given search term
   * Triggers API call
   */
  private performSearch(searchTerm: string): void {
    const currentSearchQuery = this.searchQuery();
    
    // Only update if search term actually changed
    if (searchTerm !== currentSearchQuery) {
      this.searchQuery.set(searchTerm);
      this.currentPage.set(1);
      
      // Load tasks immediately
      this.loadTasks();
    }
  }

  onSearchSubmit(): void {
    // Optional: Trigger search immediately when Enter is pressed (bypasses debounce)
    const searchTerm = this.searchInput().trim();
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      this.performSearch(searchTerm);
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchSubmit();
    }
  }

  toggleViewMode(): void {
    const newViewMode = this.viewMode() === 'list' ? 'card' : 'list';
    this.viewMode.set(newViewMode);
    // Save view type preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setViewType(routeKey, newViewMode);
  }

  onEditTask(task: Task): void {
    const dialogRef = this.dialogService.create({
      zContent: EditTaskComponent,
      zTitle: 'Edit Task',
      zWidth: '1200px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: { taskId: task.id },
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload tasks after update
        this.loadTasks();
      }
    });
  }

  onStatusChange(task: Task, newStatus: number): void {
    this.taskService.updateStatus(task.id, newStatus).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Reload tasks to get updated list from server
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        // Error is already handled by ApiService (toast notification)
      },
    });
  }

  onDeleteTask(task: Task): void {
    const taskTitle = task.title;
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Delete Task',
      zDescription: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.isDeleting.set(true);
        this.taskService.delete(task.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            // Reload tasks to get updated list from server
            this.loadTasks();
            // Remove from selection if selected
            const newSet = new Set(this.selectedRows());
            newSet.delete(task.id);
            this.selectedRows.set(newSet);
            this.isDeleting.set(false);
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.isDeleting.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
      }
    });
  }

  onAddTask(): void {
    const dialogRef = this.dialogService.create({
      zContent: EditTaskComponent,
      zTitle: 'Create Task',
      zWidth: '1200px',
      zCustomClasses: 'max-w-[calc(100vw-2rem)] sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col',
      zData: {},
      zHideFooter: true,
      zClosable: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // Reload tasks after creation
        this.loadTasks();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when page size changes
    // Save page size preference for current route
    const routeKey = this.getRouteKey();
    this.preferencesService.setPageSize(routeKey, size);
    this.loadTasks();
  }

  onSelectionChange(selection: Set<string>): void {
    this.selectedRows.set(selection);
  }

  toggleSelect(taskId: string): void {
    const newSet = new Set(this.selectedRows());
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    this.selectedRows.set(newSet);
  }

  isSelected(taskId: string): boolean {
    return this.selectedRows().has(taskId);
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  }

  getPriorityColor(priority: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (priority) {
      case 1: return 'secondary';
      case 2: return 'default';
      case 3: return 'outline';
      case 4: return 'destructive';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'To Do';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: number): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 1: return 'secondary';
      case 2: return 'default';
      case 3: return 'outline';
      default: return 'secondary';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

