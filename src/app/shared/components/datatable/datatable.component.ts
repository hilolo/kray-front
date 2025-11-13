import type { ClassValue } from 'clsx';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardTableModule } from '@shared/components/table/table.module';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardEmptyComponent } from '@shared/components/empty/empty.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { FormsModule } from '@angular/forms';
import { datatableVariants, ZardDatatableVariants } from './datatable.variants';

export interface DatatableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  cellTemplate?: TemplateRef<{ $implicit: T; row: T; column: DatatableColumn<T> }>;
  headerTemplate?: TemplateRef<{ $implicit: DatatableColumn<T> }>;
}

@Component({
  selector: 'z-datatable',
  exportAs: 'zDatatable',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardTableModule,
    ZardPaginationComponent,
    ZardEmptyComponent,
    ZardCheckboxComponent,
    ZardIconComponent,
    ZardCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './datatable.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class ZardDatatableComponent<T = any> {
  // Data inputs
  readonly zData = input<T[]>([]);
  readonly zColumns = input<DatatableColumn<T>[]>([]);
  
  // View mode
  readonly zViewMode = input<'list' | 'card'>('list');
  
  // Pagination inputs
  readonly zPageSize = input<number>(10);
  readonly zCurrentPage = input<number>(1);
  readonly zShowPagination = input<boolean>(true);
  readonly zPageSizeOptions = input<number[]>([10, 20, 50, 100]);
  
  // Empty state
  readonly zEmptyMessage = input<string>('No data available');
  readonly zShowEmpty = input<boolean>(true);
  
  // Selection
  readonly zSelectable = input<boolean>(false);
  readonly zSelectedRows = input<Set<any>>(new Set());
  
  // Styling
  readonly zType = input<ZardDatatableVariants['zType']>('default');
  readonly zSize = input<ZardDatatableVariants['zSize']>('default');
  readonly class = input<ClassValue>('');
  
  // Templates
  readonly cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly headerTemplate = contentChild<TemplateRef<any>>('headerTemplate');
  readonly emptyTemplate = contentChild<TemplateRef<any>>('emptyTemplate');
  readonly cardTemplate = contentChild<TemplateRef<any>>('cardTemplate');
  
  // Outputs
  readonly zPageChange = output<number>();
  readonly zPageSizeChange = output<number>();
  readonly zSelectionChange = output<Set<any>>();
  readonly zRowClick = output<T>();
  readonly zSortChange = output<{ column: string; direction: 'asc' | 'desc' }>();
  
  // Internal state
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly selectedRows = signal<Set<any>>(new Set());
  
  // Computed values
  protected readonly classes = computed(() =>
    mergeClasses(
      datatableVariants({
        zType: this.zType(),
        zSize: this.zSize(),
      }),
      this.class(),
    ),
  );
  
  protected readonly paginatedData = computed(() => {
    const data = this.zData();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return data.slice(start, end);
  });
  
  protected readonly totalPages = computed(() => {
    return Math.ceil(this.zData().length / this.pageSize());
  });
  
  protected readonly hasData = computed(() => {
    return this.zData().length > 0;
  });
  
  protected readonly allSelected = computed(() => {
    const data = this.paginatedData();
    const selected = this.selectedRows();
    return data.length > 0 && data.every((row: any) => selected.has(this.getRowId(row)));
  });
  
  protected readonly selectedCount = computed(() => {
    return this.selectedRows().size;
  });
  
  constructor() {
    // Sync internal state with inputs
    this.currentPage.set(this.zCurrentPage());
    this.pageSize.set(this.zPageSize());
    this.selectedRows.set(this.zSelectedRows());
  }
  
  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.zPageChange.emit(page);
  }
  
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.zPageSizeChange.emit(size);
  }
  
  // Selection methods
  toggleSelectAll(): void {
    const newSet = new Set(this.selectedRows());
    const allSelected = this.allSelected();
    
    if (allSelected) {
      this.paginatedData().forEach((row: any) => {
        newSet.delete(this.getRowId(row));
      });
    } else {
      this.paginatedData().forEach((row: any) => {
        newSet.add(this.getRowId(row));
      });
    }
    
    this.selectedRows.set(newSet);
    this.zSelectionChange.emit(newSet);
  }
  
  toggleSelect(row: T): void {
    const newSet = new Set(this.selectedRows());
    const rowId = this.getRowId(row);
    
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    
    this.selectedRows.set(newSet);
    this.zSelectionChange.emit(newSet);
  }
  
  isSelected(row: T): boolean {
    return this.selectedRows().has(this.getRowId(row));
  }
  
  // Row methods
  onRowClick(row: T): void {
    this.zRowClick.emit(row);
  }
  
  // Helper methods
  protected getRowId(row: any): any {
    // Try to get id from common properties
    return row?.id ?? row?.ID ?? row?._id ?? row;
  }
  
  protected getCellValue(row: any, column: DatatableColumn<T>): any {
    return row[column.key];
  }
  
  protected trackByIndex(index: number): number {
    return index;
  }
  
  protected trackByColumn(index: number, column: DatatableColumn<T>): string {
    return column.key;
  }
}

