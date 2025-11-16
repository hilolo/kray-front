import { ChangeDetectionStrategy, Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
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
      'flex flex-col gap-6 p-6 bg-background text-foreground',
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
      reservations: CalendarYearViewReservation[];
    }> = [];

    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayDate = new Date(currentDate);
      dayDate.setHours(0, 0, 0, 0);
      const isCurrentMonth = dayDate.getMonth() === month;
      const isToday = this.isSameDay(dayDate, today);

      // Find reservations for this date
      const dateReservations = this.reservations().filter(res => {
        const start = new Date(res.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(res.endDate);
        end.setHours(0, 0, 0, 0);
        return dayDate >= start && dayDate <= end;
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

  getReservationColor(status: 'pending' | 'active'): string {
    return status === 'pending' 
      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400' 
      : 'bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400';
  }

  getReservationDotColor(status: 'pending' | 'active'): string {
    return status === 'pending' ? 'bg-yellow-500' : 'bg-green-500';
  }
}

