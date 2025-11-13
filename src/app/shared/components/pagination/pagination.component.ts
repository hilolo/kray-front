import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, input, linkedSignal, output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClassValue } from 'clsx';

import {
  paginationContentVariants,
  paginationEllipsisVariants,
  paginationItemVariants,
  paginationNextVariants,
  paginationPreviousVariants,
  paginationVariants,
} from './pagination.variants';
import { buttonVariants, ZardButtonVariants } from '../button/button.variants';
import { ZardIconComponent } from '../icon/icon.component';
import { mergeClasses } from '@shared/utils/merge-classes';

@Component({
  selector: 'z-pagination-content',
  exportAs: 'zPaginationContent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [attr.aria-label]="ariaLabel()" role="navigation" data-slot="pagination-content" [class]="classes()">
      <ng-content></ng-content>
    </div>
  `,
})
export class ZardPaginationContentComponent {
  readonly ariaLabel = input<string>('pagination-content');

  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationContentVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-item',
  exportAs: 'zPaginationItem',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div data-slot="pagination-item" [class]="classes()">
      <ng-content></ng-content>
    </div>
  `,
})
export class ZardPaginationItemComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationItemVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-button',
  exportAs: 'zPaginationButton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      data-slot="pagination-button"
      [attr.aria-disabled]="zDisabled() || null"
      [attr.data-disabled]="zDisabled() || null"
      [attr.aria-current]="zActive() ? 'page' : undefined"
      [attr.data-active]="zActive() || null"
      [class]="classes()"
      (click)="handleClick()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ZardPaginationButtonComponent {
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zActive = input(false, { transform: booleanAttribute });
  readonly zSize = input<ZardButtonVariants['zSize']>('icon');

  readonly class = input<ClassValue>('');
  readonly zClick = output<void>();

  protected readonly classes = computed(() => mergeClasses(buttonVariants({ zType: this.zType(), zSize: this.zSize() }), this.class()));

  private readonly zType = computed<ZardButtonVariants['zType']>(() => (this.zActive() ? 'outline' : 'ghost'));

  handleClick() {
    if (!this.zDisabled() && !this.zActive()) {
      this.zClick.emit();
    }
  }
}

@Component({
  selector: 'z-pagination-previous',
  exportAs: 'zPaginationPrevious',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardPaginationButtonComponent, ZardIconComponent],
  template: `
    <z-pagination-button aria-label="Go to previous page" [class]="classes()" [zSize]="'default'">
      <z-icon zType="chevron-left" />
      <span class="hidden sm:block">Previous</span>
    </z-pagination-button>
  `,
})
export class ZardPaginationPreviousComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationPreviousVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-next',
  exportAs: 'zPaginationNext',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardPaginationButtonComponent, ZardIconComponent],
  template: `
    <z-pagination-button aria-label="Go to next page" [class]="classes()" [zSize]="'default'">
      <span class="hidden sm:block">Next</span>
      <z-icon zType="chevron-right" />
    </z-pagination-button>
  `,
})
export class ZardPaginationNextComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationNextVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-ellipsis',
  exportAs: 'zPaginationEllipsis',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardIconComponent],
  template: `
    <z-icon zType="ellipsis" aria-hidden="true" role="presentation" />
    <span class="sr-only">More pages</span>
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class ZardPaginationEllipsisComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationEllipsisVariants(), this.class()));
}

@Component({
  selector: 'z-pagination',
  exportAs: 'zPagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardPaginationContentComponent, ZardPaginationItemComponent, ZardPaginationButtonComponent, ZardPaginationEllipsisComponent, ZardIconComponent],
  template: `
    <z-pagination-content>
      <z-pagination-item>
        <z-pagination-button aria-label="Go to first page" [zSize]="zSize()" [zDisabled]="disabled() || currentPage() === 1" (zClick)="goToFirst()">
          <z-icon zType="chevrons-left" />
        </z-pagination-button>
      </z-pagination-item>

      <z-pagination-item>
        <z-pagination-button aria-label="Go to previous page" [zSize]="zSize()" [zDisabled]="disabled() || currentPage() === 1" (zClick)="goToPrevious()">
          <z-icon zType="chevron-left" />
        </z-pagination-button>
      </z-pagination-item>

      @for (item of visiblePages(); track item) {
        @if (item.type === 'page' && item.value !== undefined) {
          @let pageNumber = item.value;
          <z-pagination-item>
            <z-pagination-button [zSize]="zSize()" [zActive]="pageNumber === currentPage()" [zDisabled]="disabled()" (zClick)="goToPage(pageNumber)">
              {{ pageNumber }}
            </z-pagination-button>
          </z-pagination-item>
        } @else if (item.type === 'ellipsis') {
          <z-pagination-item>
            <z-pagination-ellipsis />
          </z-pagination-item>
        }
      }

      <z-pagination-item>
        <z-pagination-button aria-label="Go to next page" [zSize]="zSize()" [zDisabled]="disabled() || currentPage() === zTotal()" (zClick)="goToNext()">
          <z-icon zType="chevron-right" />
        </z-pagination-button>
      </z-pagination-item>

      <z-pagination-item>
        <z-pagination-button aria-label="Go to last page" [zSize]="zSize()" [zDisabled]="disabled() || currentPage() === zTotal()" (zClick)="goToLast()">
          <z-icon zType="chevrons-right" />
        </z-pagination-button>
      </z-pagination-item>
    </z-pagination-content>
  `,
  host: {
    '[class]': 'classes()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardPaginationComponent),
      multi: true,
    },
  ],
})
export class ZardPaginationComponent implements ControlValueAccessor {
  readonly zPageIndex = input<number>(1);
  readonly zTotal = input<number>(1);
  readonly zSize = input<ZardButtonVariants['zSize']>('icon');
  readonly zDisabled = input(false, { transform: booleanAttribute });

  readonly class = input<ClassValue>('');

  readonly zPageIndexChange = output<number>();

  protected readonly classes = computed(() => mergeClasses(paginationVariants(), this.class()));

  protected readonly disabled = linkedSignal(() => {
    return this.zDisabled();
  });

  readonly currentPage = linkedSignal(this.zPageIndex);

  readonly pages = computed<number[]>(() => Array.from({ length: Math.max(0, this.zTotal()) }, (_, i) => i + 1));

  readonly visiblePages = computed<Array<{ type: 'page' | 'ellipsis'; value?: number }>>(() => {
    const total = this.zTotal();
    const current = this.currentPage();
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: total }, (_, i) => ({ type: 'page' as const, value: i + 1 }));
    }

    const result: Array<{ type: 'page' | 'ellipsis'; value?: number }> = [];
    
    // Always show first page
    result.push({ type: 'page', value: 1 });
    
    if (current <= 4) {
      // Near the beginning: 1, 2, 3, 4, 5, ..., total
      for (let i = 2; i <= 5; i++) {
        result.push({ type: 'page', value: i });
      }
      result.push({ type: 'ellipsis' });
      result.push({ type: 'page', value: total });
    } else if (current >= total - 3) {
      // Near the end: 1, ..., total-4, total-3, total-2, total-1, total
      result.push({ type: 'ellipsis' });
      for (let i = total - 4; i <= total; i++) {
        result.push({ type: 'page', value: i });
      }
    } else {
      // In the middle: 1, ..., current-1, current, current+1, ..., total
      result.push({ type: 'ellipsis' });
      for (let i = current - 1; i <= current + 1; i++) {
        result.push({ type: 'page', value: i });
      }
      result.push({ type: 'ellipsis' });
      result.push({ type: 'page', value: total });
    }
    
    return result;
  });

  goToPage(page: number): void {
    if (this.disabled()) return;
    if (page !== this.currentPage() && page >= 1 && page <= this.zTotal()) {
      this.currentPage.set(page);
      this.zPageIndexChange.emit(page);
      this.onChange(page);
      this.onTouched();
    }
  }

  goToFirst() {
    this.goToPage(1);
  }

  goToPrevious() {
    this.goToPage(this.currentPage() - 1);
  }

  goToNext() {
    this.goToPage(this.currentPage() + 1);
  }

  goToLast() {
    this.goToPage(this.zTotal());
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: number) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.currentPage.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}