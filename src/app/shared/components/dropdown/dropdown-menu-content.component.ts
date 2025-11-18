import type { ClassValue } from 'clsx';

import { AfterViewInit, ChangeDetectorRef, Component, computed, inject, input, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';

import { mergeClasses } from '@shared/utils/merge-classes';
import { dropdownContentVariants } from './dropdown.variants';

@Component({
  selector: 'z-dropdown-menu-content',
  exportAs: 'zDropdownMenuContent',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #contentTemplate>
      <div [class]="contentClasses()" role="menu" tabindex="-1" [attr.aria-orientation]="'vertical'">
        <ng-content></ng-content>
      </div>
    </ng-template>
    <div [class]="contentClasses()" role="menu" tabindex="-1" [attr.aria-orientation]="'vertical'">
      <ng-content></ng-content>
    </div>
  `,
})
export class ZardDropdownMenuContentComponent implements AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly contentTemplate = viewChild<TemplateRef<unknown>>('contentTemplate');
  readonly class = input<ClassValue>('');

  protected readonly contentClasses = computed(() => mergeClasses(dropdownContentVariants(), this.class()));

  ngAfterViewInit(): void {
    // Trigger change detection to ensure @for loops are evaluated
    this.cdr.detectChanges();
  }
}
