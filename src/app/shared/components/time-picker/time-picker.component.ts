import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';

import { ZardPopoverComponent, ZardPopoverDirective } from '../popover/popover.component';
import { timePickerVariants, ZardTimePickerVariants } from './time-picker.variants';
import { ZardButtonComponent } from '../button/button.component';
import type { ClassValue } from '@shared/utils/merge-classes';
import { ZardIconComponent } from '../icon/icon.component';
import { mergeClasses } from '@shared/utils/merge-classes';

export type { ZardTimePickerVariants };

@Component({
  selector: 'z-time-picker, [z-time-picker]',
  exportAs: 'zTimePicker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ZardButtonComponent, ZardPopoverComponent, ZardPopoverDirective, ZardIconComponent],
  host: {},
  templateUrl: './time-picker.component.html',
})
export class ZardTimePickerComponent {
  readonly timePickerTemplate = viewChild.required<TemplateRef<unknown>>('timePickerTemplate');
  readonly popoverDirective = viewChild.required<ZardPopoverDirective>('popoverDirective');

  readonly class = input<ClassValue>('');
  readonly zType = input<ZardTimePickerVariants['zType']>('outline');
  readonly zSize = input<ZardTimePickerVariants['zSize']>('default');
  readonly value = input<string>(''); // Format: "HH:mm" (e.g., "14:30")
  readonly placeholder = input<string>('Pick a time');
  readonly zFormat = input<string>('HH:mm'); // Format for display
  readonly disabled = input<boolean>(false);
  readonly step = input<number>(1); // Step for minutes (1, 5, 15, 30, etc.)

  readonly timeChange = output<string>(); // Emits "HH:mm" format

  // Internal state for time selection
  readonly selectedHour = signal<number | null>(null);
  readonly selectedMinute = signal<number | null>(null);

  protected readonly classes = computed(() =>
    mergeClasses(
      timePickerVariants({
        zSize: this.zSize(),
      }),
      this.class(),
    ),
  );

  protected readonly buttonClasses = computed(() => {
    const hasValue = !!this.value();
    return mergeClasses(
      'justify-start text-left font-normal',
      !hasValue && 'text-muted-foreground',
      this.zSize() === 'sm' ? 'h-8' : this.zSize() === 'lg' ? 'h-12' : 'h-10',
      'min-w-[240px]',
    );
  });

  protected readonly textClasses = computed(() => {
    const hasValue = !!this.value();
    return mergeClasses(!hasValue && 'text-muted-foreground');
  });

  protected readonly popoverClasses = computed(() => mergeClasses('w-auto p-0'));

  protected readonly displayText = computed(() => {
    const time = this.value();
    if (!time) {
      return this.placeholder();
    }
    return this.formatTime(time, this.zFormat());
  });

  // Generate hours array (0-23)
  protected readonly hours = computed(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  });

  // Generate minutes array based on step
  protected readonly minutes = computed(() => {
    const stepValue = this.step();
    const minutes: number[] = [];
    for (let i = 0; i < 60; i += stepValue) {
      minutes.push(i);
    }
    return minutes;
  });

  constructor() {
    // Watch for value changes and update selected time
    effect(() => {
      this.updateSelectedTimeFromValue();
    });
  }

  protected onPopoverVisibilityChange(visible: boolean): void {
    if (visible) {
      // Initialize selected time from current value when opening
      this.updateSelectedTimeFromValue();
    }
  }

  protected selectHour(hour: number): void {
    this.selectedHour.set(hour);
    this.emitTimeChange();
  }

  protected selectMinute(minute: number): void {
    this.selectedMinute.set(minute);
    this.emitTimeChange();
  }

  protected getHourButtonClasses(hour: number): string {
    const isSelected = this.selectedHour() === hour;
    return mergeClasses(
      'px-3 py-1.5 text-sm rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      isSelected && 'bg-primary text-primary-foreground font-medium',
      !isSelected && 'text-foreground',
    );
  }

  protected getMinuteButtonClasses(minute: number): string {
    const isSelected = this.selectedMinute() === minute;
    return mergeClasses(
      'px-3 py-1.5 text-sm rounded-md transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      isSelected && 'bg-primary text-primary-foreground font-medium',
      !isSelected && 'text-foreground',
    );
  }

  protected formatNumber(value: number): string {
    return String(value).padStart(2, '0');
  }

  private updateSelectedTimeFromValue(): void {
    const time = this.value();
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && hours >= 0 && hours <= 23) {
        this.selectedHour.set(hours);
      }
      if (!isNaN(minutes) && minutes >= 0 && minutes <= 59) {
        this.selectedMinute.set(minutes);
      }
    } else {
      this.selectedHour.set(null);
      this.selectedMinute.set(null);
    }
  }

  private emitTimeChange(): void {
    const hour = this.selectedHour();
    const minute = this.selectedMinute();

    if (hour !== null && minute !== null) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      this.timeChange.emit(timeString);
      // Close popover after selection
      this.popoverDirective().hide();
    }
  }

  private formatTime(time: string, format: string): string {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;

    // Format based on zFormat input
    if (format === 'HH:mm' || format === 'hh:mm') {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    // 12-hour format
    if (format.includes('h')) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    // Default to HH:mm
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}

