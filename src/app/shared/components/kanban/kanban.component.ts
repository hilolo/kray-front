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
import { ZardAvatarComponent } from '../avatar/avatar.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardCircularProgressComponent } from '../circular-progress/circular-progress.component';
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
  imports: [DragDropModule, CommonModule, ZardAvatarComponent, ZardIconComponent, ZardCircularProgressComponent, ZardBadgeComponent],
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
  readonly zTaskDropped = output<{ taskId: string; newStatus: 'planned' | 'in-progress' | 'done'; previousStatus: 'planned' | 'in-progress' | 'done' }>();
  readonly zTaskClicked = output<{ taskId: string }>();

  // Convert input to signal for reactivity
  readonly columnsSignal = signal<KanbanColumn[]>([]);
  readonly draggedTaskId = signal<string | null>(null);
  readonly hoveredColumnId = signal<string | null>(null);

  constructor() {
    // Sync input with signal when input changes
    effect(() => {
      const inputColumns = this.columns();
      if (inputColumns.length > 0) {
        this.columnsSignal.set(inputColumns.map(col => ({ ...col, tasks: [...col.tasks] })));
      }
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

  // Get progress type based on progress value
  getProgressType(progress?: number): 'default' | 'success' | 'warning' {
    if (!progress) return 'default';
    if (progress === 100) return 'success';
    if (progress > 0) return 'warning';
    return 'default';
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
    
    // Find previous column status before moving
    const previousColumnIndex = currentColumns.findIndex(col => 
      col.tasks === event.previousContainer.data
    );
    const previousColumn = previousColumnIndex >= 0 ? currentColumns[previousColumnIndex] : null;
    const previousStatus = previousColumn?.status || 'planned';
    
    if (event.previousContainer === event.container) {
      // Move within same column
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
      
      // Emit event if status changed
      if (previousStatus !== newStatus) {
        this.zTaskDropped.emit({
          taskId: task.id,
          newStatus,
          previousStatus,
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
}

