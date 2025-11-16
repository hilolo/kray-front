import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { CommonModule } from '@angular/common';
import { ZardPaginationComponent } from '@shared/components/pagination/pagination.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { mergeClasses } from '@shared/utils/merge-classes';

@Component({
  selector: 'z-datatable-pagination',
  exportAs: 'zDatatablePagination',
  standalone: true,
  imports: [
    CommonModule,
    ZardPaginationComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './datatable-pagination.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class ZardDatatablePaginationComponent {
  // Pagination inputs
  readonly zCurrentPage = input<number>(1);
  readonly zTotalPages = input<number>(1);
  readonly zPageSize = input<number>(10);
  readonly zPageSizeOptions = input<number[]>([10, 20, 50, 100]);
  readonly zShow = input<boolean>(true);
  
  // Styling
  readonly class = input<ClassValue>('');
  
  // Outputs
  readonly zPageChange = output<number>();
  readonly zPageSizeChange = output<number>();
  
  protected readonly classes = computed(() =>
    mergeClasses(
      'border-t bg-background pt-4 pb-4 flex-shrink-0 -mx-6 px-6 mt-auto',
      this.class(),
    ),
  );
  
  onPageChange(page: number): void {
    this.zPageChange.emit(page);
  }
  
  onPageSizeChange(size: number): void {
    this.zPageSizeChange.emit(size);
  }
}

