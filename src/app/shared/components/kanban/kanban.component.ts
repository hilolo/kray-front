import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
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
import { CommonModule } from '@angular/common';

import type { ZardIcon } from '../icon/icons';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  dateRange?: string;
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
  imports: [DragDropModule, CommonModule, ZardAvatarComponent, ZardIconComponent],
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
}

