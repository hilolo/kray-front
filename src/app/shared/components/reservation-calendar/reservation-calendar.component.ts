import { ChangeDetectionStrategy, Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ClassValue } from 'clsx';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardBadgeComponent } from '../badge/badge.component';
import { ZardAvatarComponent } from '../avatar/avatar.component';
import { ZardCardComponent } from '../card/card.component';
import { mergeClasses } from '@shared/utils/merge-classes';
import type { Reservation } from '@shared/models/reservation/reservation.model';
import { ReservationStatus } from '@shared/models/reservation/reservation.model';

export type DateStatus = 'available' | 'pending' | 'reserved' | 'checkin' | 'checkout';

export interface CalendarDateInfo {
  date: Date;
  status: DateStatus;
  isCurrentMonth: boolean;
  isToday: boolean;
  reservations: Reservation[];
  checkInReservation?: Reservation; // Reservation that causes check-in status
  checkOutReservation?: Reservation; // Reservation that causes check-out status
}

@Component({
  selector: 'z-reservation-calendar',
  exportAs: 'zReservationCalendar',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardAvatarComponent,
    ZardCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './reservation-calendar.component.html',
})
export class ZardReservationCalendarComponent {
  readonly reservations = input<Reservation[]>([]);
  readonly class = input<ClassValue>('');

  // Current month/year being displayed
  readonly currentDate = signal(new Date());
  readonly currentMonth = computed(() => this.currentDate().getMonth());
  readonly currentYear = computed(() => this.currentDate().getFullYear());

  // Month names
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Weekday abbreviations (L, M, M, J, V, S, D)
  readonly weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Computed calendar days with status
  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first day of week (0 = Sunday, but we want Monday = 0)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    
    // Get last day of previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: CalendarDateInfo[] = [];
    
    // Add previous month's days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        status: 'available',
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        reservations: [],
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const statusInfo = this.getDateStatus(date);
      const reservations = this.getReservationsForDate(date);
      
      days.push({
        date,
        status: statusInfo.status,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        reservations,
        checkInReservation: statusInfo.checkInReservation,
        checkOutReservation: statusInfo.checkOutReservation,
      });
    }
    
    // Add next month's days to fill the grid (42 days total = 6 weeks)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        status: 'available',
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        reservations: [],
      });
    }
    
    return days;
  });

  // Get status for a specific date
  private getDateStatus(date: Date): { status: DateStatus; checkInReservation?: Reservation; checkOutReservation?: Reservation } {
    const reservations = this.reservations();
    const dateStr = this.formatDateKey(date);
    
    for (const reservation of reservations) {
      if (reservation.status === ReservationStatus.Cancelled) continue;
      
      const startDate = new Date(reservation.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(reservation.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      const startStr = this.formatDateKey(startDate);
      const endStr = this.formatDateKey(endDate);
      
      if (dateStr === startStr) {
        return { status: 'checkin', checkInReservation: reservation };
      }
      if (dateStr === endStr) {
        return { status: 'checkout', checkOutReservation: reservation };
      }
      if (date > startDate && date < endDate) {
        if (reservation.status === ReservationStatus.Pending) {
          return { status: 'pending' };
        }
        if (reservation.status === ReservationStatus.Approved) {
          return { status: 'reserved' };
        }
      }
    }
    
    return { status: 'available' };
  }

  // Get reservations for a specific date
  private getReservationsForDate(date: Date): Reservation[] {
    const reservations = this.reservations();
    const dateStr = this.formatDateKey(date);
    const result: Reservation[] = [];
    
    for (const reservation of reservations) {
      if (reservation.status === ReservationStatus.Cancelled) continue;
      
      const startDate = new Date(reservation.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(reservation.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      const startStr = this.formatDateKey(startDate);
      const endStr = this.formatDateKey(endDate);
      
      if (dateStr >= startStr && dateStr <= endStr) {
        result.push(reservation);
      }
    }
    
    return result;
  }

  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Navigation
  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  // Get month/year display
  readonly monthYearDisplay = computed(() => {
    return `${this.monthNames[this.currentMonth()]} ${this.currentYear()}`;
  });

  // Get filtered reservations (excluding cancelled)
  readonly activeReservations = computed(() => {
    return this.reservations().filter(r => r.status !== ReservationStatus.Cancelled);
  });

  // Format date for display (e.g., "15 Nov 2025")
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = dateObj.getDate();
    const month = this.monthNames[dateObj.getMonth()].substring(0, 3);
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Format date range (e.g., "15 NOV 2025 – 20 NOV 2025")
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = this.monthNames[start.getMonth()].substring(0, 3).toUpperCase();
    const endMonth = this.monthNames[end.getMonth()].substring(0, 3).toUpperCase();
    return `${start.getDate()} ${startMonth} ${start.getFullYear()} – ${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  }

  // Get status badge type
  getStatusBadgeType(status: ReservationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case ReservationStatus.Approved:
        return 'default';
      case ReservationStatus.Pending:
        return 'outline';
      case ReservationStatus.Cancelled:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  // Get status label
  getStatusLabel(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.Approved:
        return 'Approved';
      case ReservationStatus.Pending:
        return 'Pending';
      case ReservationStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  // Get tenant initials
  getTenantInitials(reservation: Reservation): string {
    const name = reservation.contactName || '';
    if (!name) return 'T';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Format amount
  formatAmount(amount: number): string {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD`;
  }

  // Get number of nights
  getNights(reservation: Reservation): number {
    // Calculate nights based on start and end dates
    // End date is checkout day (not included), so nights = days between start and end
    const startDate = new Date(reservation.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(reservation.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in milliseconds, then convert to days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Classes
  readonly classes = computed(() =>
    mergeClasses('w-full', this.class()),
  );

  // Day container classes (base background)
  getDayContainerClasses(day: CalendarDateInfo): string {
    const baseClasses = 'w-full aspect-square flex items-center justify-center text-sm font-medium transition-colors relative overflow-hidden';
    const currentMonthClasses = day.isCurrentMonth ? '' : 'text-muted-foreground/50';
    
    let statusClasses = '';
    if (day.isCurrentMonth) {
      switch (day.status) {
        case 'available':
          statusClasses = 'bg-green-600 text-white hover:bg-green-700';
          break;
        case 'pending':
          statusClasses = 'bg-yellow-500 text-white hover:bg-yellow-600';
          break;
        case 'reserved':
          statusClasses = 'bg-red-600 text-white hover:bg-red-700';
          break;
        case 'checkin':
          // Base is green (available), overlay will be red (reserved) on top-right
          statusClasses = 'bg-green-600 text-white hover:opacity-90';
          break;
        case 'checkout':
          // Base is green (available), overlay will be red (reserved) on top-left
          statusClasses = 'bg-green-600 text-white hover:opacity-90';
          break;
      }
    } else {
      statusClasses = 'bg-transparent';
    }
    
    return mergeClasses(baseClasses, currentMonthClasses, statusClasses);
  }

  // Day cell classes (for non-split days)
  getDayClasses(day: CalendarDateInfo): string {
    // This is now only used for the text/content, not the container
    return '';
  }

  // Split overlay classes for check-in/check-out
  getSplitOverlayClasses(day: CalendarDateInfo): string {
    if (day.status === 'checkin' || day.status === 'checkout') {
      // Get the reservation status to determine color
      const reservation = day.status === 'checkin' ? day.checkInReservation : day.checkOutReservation;
      if (reservation) {
        if (reservation.status === ReservationStatus.Approved) {
          return 'absolute inset-0 bg-red-600';
        } else if (reservation.status === ReservationStatus.Pending) {
          return 'absolute inset-0 bg-yellow-500';
        }
      }
      // Default to red if no reservation found (shouldn't happen)
      return 'absolute inset-0 bg-red-600';
    }
    return '';
  }

  // Get clip-path for diagonal split
  getSplitClipPath(day: CalendarDateInfo): string {
    if (day.status === 'checkin') {
      // Check-in: red on top-right half (diagonal from top-left to bottom-right)
      // Creates a triangle covering top-right: top-left (0,0) -> top-right (100%,0) -> bottom-right (100%,100%)
      return 'polygon(0 0, 100% 0, 100% 100%)';
    } else if (day.status === 'checkout') {
      // Check-out: red on top-left half (diagonal from top-right to bottom-left)
      // Creates a triangle covering top-left: top-left (0,0) -> top-right (100%,0) -> bottom-left (0,100%)
      return 'polygon(0 0, 100% 0, 0 100%)';
    }
    return '';
  }

  // Check if date has dot indicator
  hasDot(day: CalendarDateInfo): boolean {
    return day.isCurrentMonth && (day.status === 'reserved' || day.status === 'checkin' || day.status === 'checkout');
  }

  // Print calendar and reservations
  printCalendar(): void {
    const printContent = this.generatePrintContent();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }

  private generatePrintContent(): string {
    const monthName = this.monthNames[this.currentMonth()];
    const year = this.currentYear();
    const reservations = this.activeReservations();
    const days = this.calendarDays();
    
    // Generate calendar grid HTML
    const weekdaysHeader = this.weekdays.map(day => 
      `<div style="padding: 8px; text-align: center; font-weight: 600; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; background-color: #f9fafb;">${day}</div>`
    ).join('');

    const calendarDaysHtml = days.map(day => {
      const isToday = day.isToday;
      const dateNum = day.date.getDate();
      const isCurrentMonth = day.isCurrentMonth;
      
      // Get status color
      let bgColor = '#ffffff';
      let textColor = '#1f2937';
      
      if (isCurrentMonth) {
        switch (day.status) {
          case 'available':
            bgColor = '#16a34a'; // green-600
            textColor = '#ffffff';
            break;
          case 'pending':
            bgColor = '#eab308'; // yellow-500
            textColor = '#ffffff';
            break;
          case 'reserved':
            bgColor = '#dc2626'; // red-600
            textColor = '#ffffff';
            break;
          case 'checkin':
          case 'checkout':
            bgColor = '#16a34a'; // green base
            textColor = '#ffffff';
            break;
        }
      } else {
        bgColor = '#ffffff';
        textColor = '#9ca3af';
      }
      
      // Check if has split (check-in or check-out)
      const hasSplit = day.status === 'checkin' || day.status === 'checkout';
      const splitColor = hasSplit 
        ? (day.status === 'checkin' && day.checkInReservation?.status === ReservationStatus.Approved) || 
          (day.status === 'checkout' && day.checkOutReservation?.status === ReservationStatus.Approved)
          ? '#dc2626' // red-600
          : '#eab308' // yellow-500
        : '';
      
      const splitStyle = hasSplit 
        ? day.status === 'checkin'
          ? `background: linear-gradient(to bottom right, ${splitColor} 0%, ${splitColor} 50%, ${bgColor} 50%, ${bgColor} 100%);`
          : `background: linear-gradient(to bottom left, ${splitColor} 0%, ${splitColor} 50%, ${bgColor} 50%, ${bgColor} 100%);`
        : `background-color: ${bgColor};`;
      
      return `
        <div style="
          aspect-ratio: 1;
          border: 1px solid #e5e7eb; 
          padding: 4px; 
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          ${splitStyle}
          ${!isCurrentMonth ? 'opacity: 0.5;' : ''}
        ">
          <span style="
            font-size: 12px; 
            font-weight: ${isToday ? '700' : '500'}; 
            color: ${textColor};
            ${isToday ? 'background-color: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px;' : ''}
          ">
            ${dateNum}
          </span>
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

    // Generate reservations list HTML
    const reservationsListHtml = reservations.map(res => {
      const startDate = this.formatDate(res.startDate);
      const endDate = this.formatDate(res.endDate);
      const dateRange = this.formatDateRange(res.startDate, res.endDate);
      const statusLabel = this.getStatusLabel(res.status);
      const statusColor = res.status === ReservationStatus.Approved 
        ? '#dcfce7' // green-100
        : res.status === ReservationStatus.Pending
          ? '#fef3c7' // yellow-100
          : '#fee2e2'; // red-100
      const statusTextColor = res.status === ReservationStatus.Approved
        ? '#166534' // green-800
        : res.status === ReservationStatus.Pending
          ? '#92400e' // yellow-800
          : '#991b1b'; // red-800
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; color: #6b7280;">
                ${this.getTenantInitials(res).substring(0, 2)}
              </div>
              <div>
                <div style="font-weight: 500; font-size: 14px; color: #1f2937;">${this.escapeHtml(res.contactName || 'Unnamed tenant')}</div>
                <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">${this.escapeHtml(dateRange)}</div>
              </div>
            </div>
          </td>
          <td style="padding: 12px; font-size: 14px; color: #1f2937;">${this.escapeHtml(startDate)}</td>
          <td style="padding: 12px; font-size: 14px; color: #1f2937;">${this.escapeHtml(endDate)}</td>
          <td style="padding: 12px; font-size: 14px; color: #1f2937;">${this.getNights(res)} night${this.getNights(res) !== 1 ? 's' : ''}</td>
          <td style="padding: 12px; font-size: 14px; color: #1f2937; font-weight: 500;">${this.formatAmount(res.totalAmount)}</td>
          <td style="padding: 12px;">
            <span style="padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: ${statusColor}; color: ${statusTextColor};">
              ${this.escapeHtml(statusLabel)}
            </span>
          </td>
          ${res.contactPhone ? `<td style="padding: 12px; font-size: 14px; color: #1f2937;">${this.escapeHtml(res.contactPhone)}</td>` : '<td style="padding: 12px; font-size: 14px; color: #9ca3af;">-</td>'}
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservation Calendar - ${monthName} ${year}</title>
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
            .legend {
              display: flex;
              gap: 16px;
              margin-top: 15px;
              font-size: 12px;
              color: #6b7280;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 4px;
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
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 12px;
              font-size: 14px;
              color: #1f2937;
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
            ${calendarHtml}
            <div class="legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #16a34a;"></div>
                <span>Available</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #eab308;"></div>
                <span>Pending</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #dc2626;"></div>
                <span>Reserved</span>
              </div>
            </div>
          </div>
          
          <div class="reservations-section">
            <h2>Reservations (${reservations.length} ${reservations.length === 1 ? 'reservation' : 'reservations'})</h2>
            ${reservations.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  ${reservationsListHtml}
                </tbody>
              </table>
            ` : '<p style="color: #6b7280; font-style: italic;">No reservations found.</p>'}
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

