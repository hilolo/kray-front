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
        dayIndex: number; // Index in allDays array
        weekIndex: number; // Which week (0-based)
        columnInWeek: number; // Column in week (0-6)
      }>;
    }> = [];

    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build array of all days first
    const allDays: Date[] = [];
    while (currentDate <= endDate) {
      const dayDate = new Date(currentDate);
      dayDate.setHours(0, 0, 0, 0);
      allDays.push(dayDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process each day
    allDays.forEach((dayDate, dayIndex) => {
      const isCurrentMonth = dayDate.getMonth() === month;
      const isToday = this.isSameDay(dayDate, today);
      const weekIndex = Math.floor(dayIndex / 7);
      const columnInWeek = dayIndex % 7;

      // Find reservations for this date
      const dateReservations: Array<{
        reservation: CalendarYearViewReservation;
        isStart: boolean;
        isEnd: boolean;
        isFullDay: boolean;
        dayIndex: number;
        weekIndex: number;
        columnInWeek: number;
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
          dateReservations.push({
            reservation: res,
            isStart: isStartDay,
            isEnd: isEndDay,
            isFullDay: isBetween,
            dayIndex,
            weekIndex,
            columnInWeek,
          });
        }
      });

      days.push({
        date: dayDate,
        isCurrentMonth,
        isToday,
        reservations: dateReservations,
      });
    });

    return days;
  });

  // Compute spanning bars for each week
  readonly spanningBars = computed(() => {
    const bars: Array<{
      reservation: CalendarYearViewReservation;
      weekIndex: number;
      startColumn: number; // 0-6
      endColumn: number; // 0-6
      startDayIndex: number;
      endDayIndex: number;
      isStartOfReservation: boolean; // True if this bar segment is the start of the reservation
      isEndOfReservation: boolean; // True if this bar segment is the end of the reservation
      row: number; // Vertical row position for stacking (0-based)
    }> = [];

    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    // Build array of all days
    const allDays: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayDate = new Date(currentDate);
      dayDate.setHours(0, 0, 0, 0);
      allDays.push(dayDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process each reservation
    this.reservations().forEach(res => {
      const start = new Date(res.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(res.endDate);
      end.setHours(0, 0, 0, 0);

      const startDayIndex = allDays.findIndex(d => {
        const dDate = new Date(d);
        dDate.setHours(0, 0, 0, 0);
        return this.isSameDay(dDate, start);
      });

      const endDayIndex = allDays.findIndex(d => {
        const dDate = new Date(d);
        dDate.setHours(0, 0, 0, 0);
        return this.isSameDay(dDate, end);
      });

      if (startDayIndex >= 0 && endDayIndex >= 0) {
        // Group by weeks and create bars for each week the reservation spans
        const startWeek = Math.floor(startDayIndex / 7);
        const endWeek = Math.floor(endDayIndex / 7);

        for (let week = startWeek; week <= endWeek; week++) {
          const weekStartDayIndex = week * 7;
          const weekEndDayIndex = weekStartDayIndex + 6;
          
          const barStartDayIndex = Math.max(startDayIndex, weekStartDayIndex);
          const barEndDayIndex = Math.min(endDayIndex, weekEndDayIndex);
          
          const startColumn = barStartDayIndex % 7;
          const endColumn = barEndDayIndex % 7;

          bars.push({
            reservation: res,
            weekIndex: week,
            startColumn,
            endColumn,
            startDayIndex: barStartDayIndex,
            endDayIndex: barEndDayIndex,
            isStartOfReservation: barStartDayIndex === startDayIndex,
            isEndOfReservation: barEndDayIndex === endDayIndex,
            row: 0, // Will be assigned later
          });
        }
      }
    });

    // Assign a unique row to each reservation (property) so they're always on the same horizontal line
    const reservationRowMap = new Map<string, number>();
    let currentRow = 0;
    
    // Get all unique reservations and assign them rows
    const uniqueReservations = new Set(this.reservations().map(r => r.id));
    uniqueReservations.forEach(reservationId => {
      reservationRowMap.set(reservationId, currentRow);
      currentRow++;
    });

    // Assign rows to bars based on their reservation ID
    const barsWithRows = bars.map(bar => {
      const row = reservationRowMap.get(bar.reservation.id) ?? 0;
      return {
        ...bar,
        row,
      };
    });

    return barsWithRows;
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

  printCalendar(): void {
    // Create a print-friendly HTML content
    const printContent = this.generatePrintContent();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    // Write the content to the print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (optional)
        // printWindow.close();
      }, 250);
    };
  }

  private generatePrintContent(): string {
    const monthName = this.currentMonthName();
    const year = this.currentYear();
    const currentMonth = this.currentMonth();
    const allReservations = this.reservations();
    const days = this.monthDays();
    
    // Filter reservations to only include those that fall within the current month
    const monthStart = new Date(year, currentMonth, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, currentMonth + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    const reservations = allReservations
      .filter(res => {
        const resStart = new Date(res.startDate);
        resStart.setHours(0, 0, 0, 0);
        const resEnd = new Date(res.endDate);
        resEnd.setHours(23, 59, 59, 999);
        
        // Include if reservation overlaps with the current month
        return (resStart <= monthEnd && resEnd >= monthStart);
      })
      .sort((a, b) => {
        // Sort by start date
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      });
    
    // Format reservations for the list
    const reservationsListHtml = reservations.map(res => {
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      const startDateStr = startDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const endDateStr = endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; font-weight: 500;">${this.escapeHtml(res.propertyIdentifier || 'N/A')}</td>
          <td style="padding: 8px;">${this.escapeHtml(res.contactName || 'N/A')}</td>
          <td style="padding: 8px;">${startDateStr} - ${endDateStr}</td>
          <td style="padding: 8px;">
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; 
              ${res.status === 'active' 
                ? 'background-color: #dcfce7; color: #166534;' 
                : 'background-color: #fef3c7; color: #92400e;'
              }">
              ${res.status === 'active' ? 'Active' : 'Pending'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // Generate calendar grid HTML
    const weekdaysHeader = this.weekdays.map(day => 
      `<div style="padding: 8px; text-align: center; font-weight: 600; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; background-color: #f9fafb;">${day}</div>`
    ).join('');

    const calendarDaysHtml = days.map(day => {
      const isToday = day.isToday;
      const dateNum = day.date.getDate();
      const isCurrentMonth = day.isCurrentMonth;
      
      // Get all reservations for this day (not just starting ones)
      const dayReservations = day.reservations;
      
      // Create labels for each reservation, showing different info based on position
      const reservationLabels = dayReservations.map(r => {
        const isStart = r.isStart;
        const isEnd = r.isEnd;
        const isFullDay = r.isFullDay;
        
        let label = '';
        if (isStart) {
          // Show full info on start day
          label = `${r.reservation.propertyIdentifier || ''}${r.reservation.propertyIdentifier && r.reservation.contactName ? ' - ' : ''}${r.reservation.contactName || ''}`;
        } else if (isEnd) {
          // Show property identifier on end day
          label = r.reservation.propertyIdentifier || r.reservation.contactName || '';
        } else if (isFullDay) {
          // Show property identifier for days in between
          label = r.reservation.propertyIdentifier || r.reservation.contactName || '';
        }
        
        return {
          label: label.trim(),
          isStart,
          isEnd,
          isFullDay
        };
      }).filter(item => item.label).slice(0, 3); // Limit to 3 per day for print
      
      const remainingCount = dayReservations.length - reservationLabels.length;
      
      return `
        <div style="
          min-height: 80px; 
          border: 1px solid #e5e7eb; 
          padding: 4px; 
          position: relative;
          ${!isCurrentMonth ? 'background-color: #f9fafb; opacity: 0.6;' : ''}
        ">
          <div style="
            font-size: 12px; 
            font-weight: ${isToday ? '700' : '500'}; 
            margin-bottom: 4px;
            ${isToday ? 'background-color: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; display: inline-block;' : 'color: ' + (isCurrentMonth ? '#1f2937' : '#9ca3af') + ';'}
          ">
            ${dateNum}
          </div>
          <div style="font-size: 10px; color: #6b7280; line-height: 1.3;">
            ${reservationLabels.map(item => {
              const style = item.isStart 
                ? 'margin-top: 2px; font-weight: 500;' 
                : item.isEnd 
                  ? 'margin-top: 2px; font-style: italic;' 
                  : 'margin-top: 2px;';
              return `<div style="${style}">${this.escapeHtml(item.label)}</div>`;
            }).join('')}
            ${remainingCount > 0 ? `<div style="margin-top: 2px; font-style: italic; color: #9ca3af;">+${remainingCount} more</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const calendarHtml = `
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid #e5e7eb;">
          ${weekdaysHeader}
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid #e5e7eb; border-top: none;">
          ${calendarDaysHtml}
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Calendar - ${monthName} ${year}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: #1f2937;
              padding: 20px;
              background: white;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 15px;
            }
            .print-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
              color: #111827;
            }
            .print-header p {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #6b7280;
            }
            .calendar-section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .calendar-section h2 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #111827;
            }
            .reservations-section {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .reservations-section h2 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f9fafb;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 8px;
              font-size: 14px;
              color: #1f2937;
            }
            .calendar-grid {
              border: 1px solid #e5e7eb;
            }
            .calendar-grid > div {
              border: 1px solid #e5e7eb;
            }
            .print-footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Reservation Calendar</h1>
            <p>${monthName} ${year}</p>
            <p style="font-size: 12px; margin-top: 5px;">Printed on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div class="calendar-section">
            <h2>Calendar View</h2>
            ${calendarHtml || '<p>Calendar view not available</p>'}
          </div>
          
          <div class="reservations-section">
            <h2>Reservations List (${reservations.length} ${reservations.length === 1 ? 'reservation' : 'reservations'})</h2>
            ${reservations.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Contact</th>
                    <th>Period</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${reservationsListHtml}
                </tbody>
              </table>
            ` : '<p style="color: #6b7280; font-style: italic;">No reservations for this period.</p>'}
          </div>
          
          <div class="print-footer">
            <p>Generated from Admin Template</p>
          </div>
        </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

