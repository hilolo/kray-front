import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { mergeClasses } from '@shared/utils/merge-classes';
import { circularProgressVariants, ZardCircularProgressVariants } from './circular-progress.variants';

@Component({
  selector: 'z-circular-progress',
  exportAs: 'zCircularProgress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './circular-progress.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class ZardCircularProgressComponent {
  readonly zSize = input<ZardCircularProgressVariants['zSize']>('default');
  readonly zType = input<ZardCircularProgressVariants['zType']>('default');
  readonly class = input<ClassValue>('');
  readonly progress = input(0); // 0-100
  readonly showLabel = input(true);
  readonly label = input<string>('');

  readonly correctedProgress = computed(() => {
    const value = this.progress();
    if (value > 100) return 100;
    if (value < 0) return 0;
    return value;
  });

  readonly circumference = computed(() => {
    const size = this.zSize();
    const radius = size === 'sm' ? 18 : size === 'lg' ? 30 : 24;
    return 2 * Math.PI * radius;
  });

  readonly radius = computed(() => {
    const size = this.zSize();
    return size === 'sm' ? 18 : size === 'lg' ? 30 : 24;
  });

  readonly strokeDashoffset = computed(() => {
    const progress = this.correctedProgress();
    const circumference = this.circumference();
    return circumference - (progress / 100) * circumference;
  });

  readonly displayLabel = computed(() => {
    if (this.label()) return this.label();
    return `${Math.round(this.correctedProgress())}%`;
  });

  protected readonly classes = computed(() =>
    mergeClasses(circularProgressVariants({ zSize: this.zSize(), zType: this.zType() }), this.class()),
  );
}

