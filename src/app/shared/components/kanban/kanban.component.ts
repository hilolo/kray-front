import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '@shared/utils/merge-classes';
import {
  kanbanVariants,
  kanbanColumnVariants,
  kanbanColumnHeaderVariants,
  kanbanColumnTitleVariants,
  kanbanColumnCountVariants,
  kanbanCardVariants,
} from './kanban.variants';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardBadgeComponent } from '../badge/badge.component';
import { CommonModule } from '@angular/common';

import type { ZardIcon } from '../icon/icons';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  dateRange?: string;
  assignedUsers?: Array<{
    url?: string;
    fallback: string;
  }>;
  progress?: number; // 0-100
  priority?: 'High' | 'Medium' | 'Low';
  attachmentCount?: number;
  commentCount?: number;
  avatar?: {
    url?: string;
    fallback: string;
  };
  icon?: ZardIcon;
  // Property information
  propertyName?: string;
  propertyAddress?: string;
  propertyImageUrl?: string | null;
  propertyReference?: string; // Property identifier/reference
  // Service/Contact information
  serviceName?: string;
  serviceAvatarUrl?: string | null;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'done';
  tasks: KanbanTask[];
  color?: string;
}

@Component({
  selector: 'z-kanban',
  exportAs: 'zKanban',
  standalone: true,
  imports: [DragDropModule, CommonModule, ZardIconComponent, ZardBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './kanban.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class ZardKanbanComponent {
  readonly columns = input<KanbanColumn[]>([]);
  readonly class = input<ClassValue>('');
  readonly zTaskDropped = output<{ taskId: string; newStatus: 'planned' | 'in-progress' | 'done'; previousStatus: 'planned' | 'in-progress' | 'done'; newColumnId?: string; previousColumnId?: string }>();
  readonly zTaskClicked = output<{ taskId: string }>();

  // Convert input to signal for reactivity
  readonly columnsSignal = signal<KanbanColumn[]>([]);
  readonly draggedTaskId = signal<string | null>(null);
  readonly hoveredColumnId = signal<string | null>(null);

  constructor() {
    // Sync input with signal when input changes
    effect(() => {
      const inputColumns = this.columns();
      // Always update, even if empty, to ensure reactivity
      this.columnsSignal.set(inputColumns.map(col => ({ ...col, tasks: [...col.tasks] })));
    });
  }

  // Computed columns with signal
  readonly columnsData = computed(() => this.columnsSignal());

  protected readonly classes = computed(() => mergeClasses(kanbanVariants(), this.class()));

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'planned':
        return 'bg-gray-500';
      case 'in-progress':
        return 'bg-orange-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Get priority badge type
  getPriorityBadgeType(priority?: string): 'default' | 'destructive' | 'secondary' {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  }


  // Truncate description
  truncateDescription(description?: string, maxLength: number = 60): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  // Get connected columns for drag-drop
  getConnectedColumns(): string[] {
    return this.columnsData().map((_, index) => this.getColumnId(index));
  }

  // Handle drag started
  onDragStarted(taskId: string): void {
    this.draggedTaskId.set(taskId);
  }

  // Handle drag ended
  onDragEnded(): void {
    this.draggedTaskId.set(null);
    this.hoveredColumnId.set(null);
  }

  // Handle column hover during drag
  onColumnEnter(columnIdOrIndex: string | number): void {
    if (this.draggedTaskId()) {
      // If it's a number (index), convert to column ID format
      const columnId = typeof columnIdOrIndex === 'number' 
        ? this.columnsData()[columnIdOrIndex]?.id 
        : columnIdOrIndex;
      if (columnId) {
        this.hoveredColumnId.set(columnId);
      }
    }
  }

  // Handle column leave
  onColumnLeave(): void {
    // Only clear if we're not actively dragging
    if (!this.draggedTaskId()) {
      this.hoveredColumnId.set(null);
    }
  }

  // Handle drag enter on drop list
  onDragEnter(event: any): void {
    const columnId = event.container?.id || event.container?.element?.nativeElement?.id;
    if (columnId && this.draggedTaskId()) {
      this.hoveredColumnId.set(columnId.replace('column-', ''));
    }
  }

  // Handle drag and drop
  drop(event: CdkDragDrop<KanbanTask[]>): void {
    const currentColumns = [...this.columnsSignal()];
    const task = event.item.data as KanbanTask;
    
    if (!task || !task.id) {
      console.error('Invalid task data in drop event:', task);
      return;
    }
    
    // Find previous column status before moving
    const previousColumnIndex = currentColumns.findIndex(col => 
      col.tasks === event.previousContainer.data
    );
    const previousColumn = previousColumnIndex >= 0 ? currentColumns[previousColumnIndex] : null;
    const previousStatus = previousColumn?.status || 'planned';
    const previousColumnId = previousColumn?.id || '';
    
    if (event.previousContainer === event.container) {
      // Move within same column - no status change, just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Find new column status after moving
      // Find which column's tasks array matches the container data
      const newColumnIndex = currentColumns.findIndex(col => 
        col.tasks === event.container.data
      );
      const newColumn = newColumnIndex >= 0 ? currentColumns[newColumnIndex] : null;
      const newStatus = newColumn?.status || 'planned';
      const newColumnId = newColumn?.id || '';
      
      // Emit event if status changed or column changed
      if (previousStatus !== newStatus || previousColumnId !== newColumnId) {
        this.zTaskDropped.emit({
          taskId: task.id,
          newStatus,
          previousStatus,
          newColumnId,
          previousColumnId,
        });
      }
    }

    // Update signal with new state
    this.columnsSignal.set(currentColumns);
    this.draggedTaskId.set(null);
    this.hoveredColumnId.set(null);
  }

  // Check if column is hovered
  isColumnHovered(columnId: string): boolean {
    return this.hoveredColumnId() === columnId && !!this.draggedTaskId();
  }

  // Get column ID for CDK drag-drop
  getColumnId(index: number): string {
    return `column-${index}`;
  }

  // Handle task click
  onTaskClick(taskId: string): void {
    // Only emit if not dragging
    if (!this.draggedTaskId()) {
      this.zTaskClicked.emit({ taskId });
    }
  }

  // Handle image error - show fallback
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const fallback = img.nextElementSibling as HTMLElement;
      if (fallback) {
        fallback.classList.remove('hidden');
        fallback.style.display = 'flex';
      }
    }
  }
}

