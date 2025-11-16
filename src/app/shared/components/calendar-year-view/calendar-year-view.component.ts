import { ChangeDetectionStrategy, Component, computed, input, output, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ClassValue } from 'clsx';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardSelectComponent } from '../select/select.component';
import { ZardSelectItemComponent } from '../select/select-item.component';
import { mergeClasses } from '@shared/utils/merge-classes';

export interface CalendarYearViewEvent {
  date: Date;
  reservationId?: string;
}

export interface CalendarYearViewReservation {
  id: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active';
  title?: string;
  propertyId: string;
  propertyIdentifier?: string;
  contactName: string;
}

@Component({
  selector: 'z-calendar-year-view',
  exportAs: 'zCalendarYearView',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ZardButtonComponent, ZardIconComponent, ZardSelectComponent, ZardSelectItemComponent],
  templateUrl: './calendar-year-view.component.html',
})
export class ZardCalendarYearViewComponent {
  readonly reservations = input<CalendarYearViewReservation[]>([]);
  readonly currentDate = signal(new Date());
  readonly selectedDate = signal<Date | null>(null);
  readonly class = input<ClassValue>('');
  readonly reservationClick = output<string>();

  readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  readonly availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  });

  readonly classes = computed(() =>
    mergeClasses(
      'flex flex-col gap-4 p-4 bg-background text-foreground',
      this.class(),
    ),
  );

  readonly currentMonth = computed(() => {
    const date = this.currentDate();
    return date.getMonth();
  });

  readonly currentYear = computed(() => {
    const date = this.currentDate();
    return date.getFullYear();
  });

  readonly currentMonthName = computed(() => {
    return this.months[this.currentMonth()];
  });

  readonly monthDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      reservations: Array<{
        reservation: CalendarYearViewReservation;
        isStart: boolean;
        isEnd: boolean;
        isFullDay: boolean;
        isFirstHalf: boolean;
        isSecondHalf: boolean;
      }>;
    }> = [];

    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayDate = new Date(currentDate);
      dayDate.setHours(0, 0, 0, 0);
      const isCurrentMonth = dayDate.getMonth() === month;
      const isToday = this.isSameDay(dayDate, today);

      // Find reservations for this date with half-day logic
      const dateReservations: Array<{
        reservation: CalendarYearViewReservation;
        isStart: boolean;
        isEnd: boolean;
        isFullDay: boolean;
        isFirstHalf: boolean;
        isSecondHalf: boolean;
      }> = [];

      this.reservations().forEach(res => {
        const start = new Date(res.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(res.endDate);
        end.setHours(0, 0, 0, 0);
        
        const isStartDay = this.isSameDay(dayDate, start);
        const isEndDay = this.isSameDay(dayDate, end);
        const isBetween = dayDate > start && dayDate < end;
        
        if (isStartDay || isEndDay || isBetween) {
          // Start on second half, end on first half
          const isStart = isStartDay;
          const isEnd = isEndDay;
          const isFullDay = isBetween;
          const isFirstHalf = isEnd && !isStart; // End date shows in first half
          const isSecondHalf = isStart && !isEnd; // Start date shows in second half
          
          dateReservations.push({
            reservation: res,
            isStart,
            isEnd,
            isFullDay,
            isFirstHalf,
            isSecondHalf,
          });
        }
      });

      days.push({
        date: dayDate,
        isCurrentMonth,
        isToday,
        reservations: dateReservations,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  });

  previousMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(date);
  }

  nextMonth(): void {
    const date = new Date(this.currentDate());
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(date);
  }

  goToToday(): void {
    const today = new Date();
    this.currentDate.set(today);
    this.selectedDate.set(today);
  }

  onYearChange(year: string): void {
    const date = new Date(this.currentDate());
    date.setFullYear(parseInt(year, 10));
    this.currentDate.set(date);
  }

  onMonthChange(month: string): void {
    const date = new Date(this.currentDate());
    date.setMonth(parseInt(month, 10));
    this.currentDate.set(date);
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Generate unique color for each property
  private readonly propertyColors = new Map<string, string>();
  
  private readonly colorPalette = [
    { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
    { bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
    { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
    { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
    { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
    { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-500' },
  ];

  getPropertyColor(propertyId: string): { bg: string; border: string; text: string; dot: string } {
    if (!this.propertyColors.has(propertyId)) {
      const index = this.propertyColors.size % this.colorPalette.length;
      this.propertyColors.set(propertyId, index.toString());
    }
    const index = parseInt(this.propertyColors.get(propertyId) || '0', 10);
    return this.colorPalette[index];
  }

  getReservationColor(propertyId: string): string {
    const color = this.getPropertyColor(propertyId);
    return `${color.bg} ${color.border} ${color.text}`;
  }

  getReservationDotColor(propertyId: string): string {
    const color = this.getPropertyColor(propertyId);
    return color.dot;
  }

  onReservationClick(reservationId: string, event: Event): void {
    event.stopPropagation();
    this.reservationClick.emit(reservationId);
  }
}

