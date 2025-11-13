import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { Property } from '../property.types';
import { Reservation } from '../../reservation/reservation.types';

export interface PrintCalendarOptions {
    property: Property | null;
    monthYearLabel: string;
    reservations: Reservation[];
    formatDate: (date: string | null | undefined) => string;
    formatAmount: (amount: number | null | undefined) => string;
    getReservationStatusLabel: (status: any) => string;
    getReservationDuration: (reservation: Reservation) => string;
    calendarSelector?: string;
    reservationsSelector?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PrintService
{
    /**
     * Constructor
     */
    constructor(
        private _errorHandlerService: ErrorHandlerService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Print calendar and reservations
     */
    printCalendarAndReservations(options: PrintCalendarOptions): void
    {
        if (typeof window === 'undefined')
        {
            return;
        }

        const {
            property,
            monthYearLabel,
            reservations,
            formatDate,
            formatAmount,
            getReservationStatusLabel,
            getReservationDuration,
            calendarSelector = '.print-calendar-section',
            reservationsSelector = '.print-reservations-section'
        } = options;

        // Get calendar HTML
        const calendarElement = document.querySelector(calendarSelector);

        if (!calendarElement)
        {
            this._errorHandlerService.showErrorAlert(
                'Print Error',
                'Could not find calendar section to print.'
            );
            return;
        }

        // Create print styles
        const printStyles = this._getPrintStyles();

        // Create print header with property info
        const printHeader = this._createPrintHeader(property, monthYearLabel);

        // Create calendar HTML
        const calendarHtml = this._createCalendarHtml(calendarElement);

        // Create reservations HTML
        const reservationsHtml = this._createReservationsHtml(
            reservations,
            formatDate,
            formatAmount,
            getReservationStatusLabel,
            getReservationDuration
        );

        // Create footer
        const footer = this._createFooter();

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow)
        {
            this._errorHandlerService.showErrorAlert(
                'Print Error',
                'Please allow pop-ups to print the calendar and reservations.'
            );
            return;
        }

        // Write to print window
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Calendar and Reservations - ${property?.name || 'Property'}</title>
                    <meta charset="utf-8">
                    ${printStyles}
                </head>
                <body>
                    ${printHeader}
                    ${calendarHtml}
                    ${reservationsHtml}
                    ${footer}
                </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for content to load, then print
        setTimeout(() =>
        {
            printWindow.focus();
            printWindow.print();
            // Close window after printing (optional - commented out so user can review)
            // printWindow.close();
        }, 500);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get print styles
     */
    private _getPrintStyles(): string
    {
        return `
            <style>
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                        /* Remove URL and page info from print */
                        margin-bottom: 0;
                    }
                    
                    /* Hide URL from print margins */
                    @page {
                        @top-right {
                            content: none;
                        }
                        @bottom-right {
                            content: none;
                        }
                        @bottom-left {
                            content: none;
                        }
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        color: #111827;
                        background: white;
                    }
                    
                    /* Hide browser URL in print */
                    body::after {
                        display: none !important;
                        content: none !important;
                    }
                    
                    /* Hide any URL display */
                    a[href]:after {
                        content: none !important;
                    }
                    
                    .print-page {
                        page-break-after: always;
                        page-break-inside: avoid;
                    }
                    
                    .print-page:last-child {
                        page-break-after: auto;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 0.75rem;
                        padding-bottom: 0.5rem;
                        border-bottom: 2px solid #e5e7eb;
                        page-break-inside: avoid;
                    }
                    
                    .print-header h1 {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 0.3rem 0;
                    }
                    
                    .print-header h2 {
                        font-size: 1rem;
                        font-weight: 600;
                        color: #374151;
                        margin: 0.3rem 0;
                    }
                    
                    .print-header .property-info {
                        text-align: left;
                        margin-top: 0.5rem;
                        padding-top: 0.5rem;
                        border-top: 1px solid #e5e7eb;
                    }
                    
                    .print-header .property-info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 0.3rem;
                        font-size: 0.75rem;
                    }
                    
                    .print-header .property-info-label {
                        font-weight: 600;
                        color: #6b7280;
                        margin-right: 1rem;
                    }
                    
                    .print-header .property-info-value {
                        color: #111827;
                    }
                    
                    .print-calendar-page {
                        page-break-after: always;
                        page-break-inside: avoid;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    
                    .print-calendar {
                        border: 2px solid #e5e7eb;
                        border-radius: 0.5rem;
                        padding: 0.75rem;
                        background: white;
                        page-break-inside: avoid;
                        height: auto;
                        max-height: calc(100vh - 4cm);
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .print-calendar h3 {
                        text-align: center;
                        font-size: 1.1rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 0.75rem 0;
                    }
                    
                    .calendar-grid {
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        grid-auto-rows: 1fr;
                        gap: 0.2rem;
                        page-break-inside: avoid;
                        flex: 1;
                        min-height: 0;
                    }
                    
                    .calendar-day-header {
                        text-align: center;
                        font-weight: 600;
                        font-size: 0.75rem;
                        color: #374151;
                        padding: 0.4rem;
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                    }
                    
                    .calendar-day {
                        width: 100%;
                        aspect-ratio: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #e5e7eb;
                        border-radius: 0.25rem;
                        padding: 0.25rem;
                        font-size: 0.7rem;
                        font-weight: 500;
                        position: relative;
                        background: white;
                        min-height: 0;
                        min-width: 0;
                        box-sizing: border-box;
                        align-self: stretch;
                    }
                    
                    .calendar-day.available {
                        background: #dcfce7 !important;
                        color: #166534;
                    }
                    
                    .calendar-day.reserved {
                        background: #fce7f3 !important;
                        color: #831843;
                    }
                    
                    .calendar-day.pending {
                        background: #fef3c7 !important;
                        color: #78350f;
                    }
                    
                    .calendar-day.start {
                        background: linear-gradient(to bottom right, #dcfce7 0%, #dcfce7 50%, #fce7f3 50%, #fce7f3 100%) !important;
                    }
                    
                    .calendar-day.start.pending {
                        background: linear-gradient(to bottom right, #dcfce7 0%, #dcfce7 50%, #fef3c7 50%, #fef3c7 100%) !important;
                    }
                    
                    .calendar-day.end {
                        background: linear-gradient(to bottom right, #fce7f3 0%, #fce7f3 50%, #dcfce7 50%, #dcfce7 100%) !important;
                    }
                    
                    .calendar-day.end.pending {
                        background: linear-gradient(to bottom right, #fef3c7 0%, #fef3c7 50%, #dcfce7 50%, #dcfce7 100%) !important;
                    }
                    
                    .calendar-day.mixed-end-start {
                        width: 100%;
                        aspect-ratio: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #e5e7eb;
                        border-radius: 0.25rem;
                        padding: 0.25rem;
                        font-size: 0.7rem;
                        font-weight: 500;
                        position: relative;
                        background: linear-gradient(to bottom right, #fce7f3 0%, #fce7f3 50%, #fef3c7 50%, #fef3c7 100%) !important;
                        color: #111827 !important;
                        min-height: 0;
                        min-width: 0;
                        box-sizing: border-box;
                        align-self: stretch;
                    }
                    
                    .calendar-day-number {
                        font-weight: 600;
                        margin-bottom: 0.15rem;
                        font-size: 0.7rem;
                    }
                    
                    .calendar-day-dots {
                        display: flex;
                        gap: 0.1rem;
                        margin-top: 0.15rem;
                    }
                    
                    .calendar-day-dot {
                        width: 0.3rem;
                        height: 0.3rem;
                        border-radius: 50%;
                    }
                    
                    .calendar-legend {
                        margin-top: 0.75rem;
                        padding-top: 0.5rem;
                        border-top: 1px solid #e5e7eb;
                        display: flex;
                        justify-content: center;
                        gap: 1.25rem;
                        flex-wrap: wrap;
                        page-break-inside: avoid;
                    }
                    
                    .calendar-legend-item {
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        font-size: 0.75rem;
                    }
                    
                    .calendar-legend-color {
                        width: 1rem;
                        height: 1rem;
                        border-radius: 0.25rem;
                        border: 1px solid #d1d5db;
                    }
                    
                    .print-reservations-page {
                        page-break-after: auto;
                    }
                    
                    .print-reservations {
                        margin-top: 2rem;
                    }
                    
                    .print-reservations h3 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 1.5rem 0;
                        padding-bottom: 0.75rem;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    
                    .reservation-item {
                        border: 1px solid #e5e7eb;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        background: white;
                        page-break-inside: avoid;
                    }
                    
                    .reservation-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1rem;
                    }
                    
                    .reservation-guest {
                        flex: 1;
                    }
                    
                    .reservation-guest-name {
                        font-size: 1.125rem;
                        font-weight: 600;
                        color: #111827;
                        margin-bottom: 0.25rem;
                    }
                    
                    .reservation-guest-dates {
                        font-size: 0.875rem;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    
                    .reservation-status {
                        padding: 0.375rem 0.75rem;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    
                    .reservation-status.pending {
                        background: #fef3c7 !important;
                        color: #78350f !important;
                    }
                    
                    .reservation-status.approved {
                        background: #d1fae5 !important;
                        color: #065f46 !important;
                    }
                    
                    .reservation-status.rejected {
                        background: #fee2e2 !important;
                        color: #991b1b !important;
                    }
                    
                    .reservation-status.cancelled {
                        background: #f3f4f6 !important;
                        color: #374151 !important;
                    }
                    
                    .reservation-status.completed {
                        background: #dbeafe !important;
                        color: #1e40af !important;
                    }
                    
                    .reservation-details {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1rem;
                        margin-top: 1rem;
                    }
                    
                    .reservation-detail-item {
                        font-size: 0.875rem;
                    }
                    
                    .reservation-detail-label {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-bottom: 0.25rem;
                    }
                    
                    .reservation-detail-value {
                        font-weight: 600;
                        color: #111827;
                    }
                    
                    .print-footer {
                        margin-top: 2rem;
                        padding-top: 1rem;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 0.75rem;
                        color: #6b7280;
                    }
                }
            </style>
        `;
    }

    /**
     * Create print header with property information
     */
    private _createPrintHeader(property: Property | null, monthYearLabel: string): string
    {
        if (!property)
        {
            return '';
        }

        return `
            <div class="print-header">
                <h1>${property.name || property.identifier || 'Property'}</h1>
                <h2>Calendar and Reservations - ${monthYearLabel}</h2>
                <div class="property-info">
                    <div class="property-info-row">
                        <span class="property-info-label">Reference:</span>
                        <span class="property-info-value">${property.identifier || 'N/A'}</span>
                    </div>
                    <div class="property-info-row">
                        <span class="property-info-label">Address:</span>
                        <span class="property-info-value">${property.address || 'N/A'}${property.city ? ', ' + property.city : ''}</span>
                    </div>
                    <div class="property-info-row">
                        <span class="property-info-label">Type:</span>
                        <span class="property-info-value">${property.typeProperty || 'N/A'}</span>
                    </div>
                    <div class="property-info-row">
                        <span class="property-info-label">Area:</span>
                        <span class="property-info-value">${property.area ? property.area + ' m²' : 'N/A'}</span>
                    </div>
                    <div class="property-info-row">
                        <span class="property-info-label">Rooms:</span>
                        <span class="property-info-value">${property.pieces || 0}</span>
                    </div>
                    <div class="property-info-row">
                        <span class="property-info-label">Price:</span>
                        <span class="property-info-value">${property.price ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(property.price) + ' MAD' : 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create calendar HTML
     */
    private _createCalendarHtml(calendarElement: Element): string
    {
        const clone = calendarElement.cloneNode(true) as HTMLElement;
        
        // Remove no-print elements
        const noPrintElements = clone.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.remove());

        // Get month year label
        const monthYearElement = clone.querySelector('h3');
        const monthYearLabel = monthYearElement?.textContent?.trim() || '';

        // Get calendar days - look for elements with aspect-square class
        const calendarDays = clone.querySelectorAll('[class*="aspect-square"]');
        
        // Build calendar HTML
        let calendarDaysHtml = '';
        calendarDays.forEach((day) => {
            const dayElement = day as HTMLElement;
            const dayNumber = dayElement.querySelector('span')?.textContent?.trim() || '';
            const dayClasses = dayElement.className || '';
            
            // Determine day status from classes
            let statusClass = 'available';
            let isStart = false;
            let isEnd = false;
            let isPending = false;
            
            // Check for reserved status (pink colors)
            if (dayClasses.includes('bg-pink-300') || dayClasses.includes('bg-pink-400') || 
                dayClasses.includes('bg-pink-600') || dayClasses.includes('bg-pink-900')) {
                statusClass = 'reserved';
            }
            
            // Check for pending status (yellow colors)
            if (dayClasses.includes('bg-yellow-200') || dayClasses.includes('bg-yellow-400') || 
                dayClasses.includes('bg-yellow-600') || dayClasses.includes('bg-yellow-900')) {
                statusClass = 'pending';
                isPending = true;
            }
            
            // Check for available status (green colors)
            if (dayClasses.includes('bg-green-100') || dayClasses.includes('bg-green-900')) {
                statusClass = 'available';
            }
            
            // Check for mixed state (end marker from previous day + start marker for pending)
            const isMixed = dayClasses.includes('calendar-day-end-start-mixed');
            
            // Check for start/end classes
            const isStartYellow = dayClasses.includes('calendar-day-selected-start-yellow');
            const isEndYellow = dayClasses.includes('calendar-day-selected-end-yellow');
            
            if (dayClasses.includes('calendar-day-selected-start') || isStartYellow) {
                isStart = true;
            }
            if (dayClasses.includes('calendar-day-selected-end') || isEndYellow) {
                isEnd = true;
            }
            
            // Build day class
            // For mixed state, don't apply statusClass to avoid conflicts
            let dayClass = isMixed ? 'calendar-day' : `calendar-day ${statusClass}`;
            if (isMixed) {
                // Mixed state: top-left pink/red (end) and bottom-right yellow (start)
                dayClass += ' mixed-end-start';
            } else if (isStart) {
                dayClass += ' start';
                if (isStartYellow || isPending) {
                    dayClass += ' pending';
                }
            } else if (isEnd) {
                dayClass += ' end';
                // Use isEndYellow to detect if the end marker is for a pending reservation
                if (isEndYellow || isPending) {
                    dayClass += ' pending';
                }
            }
            
            calendarDaysHtml += `
                <div class="${dayClass}">
                    <span class="calendar-day-number">${dayNumber}</span>
                </div>
            `;
        });

        return `
            <div class="print-page print-calendar-page">
                <div class="print-calendar">
                    <h3>${monthYearLabel}</h3>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">L</div>
                        <div class="calendar-day-header">M</div>
                        <div class="calendar-day-header">M</div>
                        <div class="calendar-day-header">J</div>
                        <div class="calendar-day-header">V</div>
                        <div class="calendar-day-header">S</div>
                        ${calendarDaysHtml}
                    </div>
                    <div class="calendar-legend">
                        <div class="calendar-legend-item">
                            <div class="calendar-legend-color" style="background: #dcfce7; border-color: #86efac;"></div>
                            <span>Available</span>
                        </div>
                        <div class="calendar-legend-item">
                            <div class="calendar-legend-color" style="background: #fef3c7; border-color: #fde047;"></div>
                            <span>Pending</span>
                        </div>
                        <div class="calendar-legend-item">
                            <div class="calendar-legend-color" style="background: #fce7f3; border-color: #f9a8d4;"></div>
                            <span>Reserved</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create reservations HTML
     */
    private _createReservationsHtml(
        reservations: Reservation[],
        formatDate: (date: string | null | undefined) => string,
        formatAmount: (amount: number | null | undefined) => string,
        getReservationStatusLabel: (status: any) => string,
        getReservationDuration: (reservation: Reservation) => string
    ): string
    {
        if (!reservations || reservations.length === 0)
        {
            return `
                <div class="print-page print-reservations-page">
                    <div class="print-reservations">
                        <h3>Reservations</h3>
                        <p>No reservations recorded.</p>
                    </div>
                </div>
            `;
        }

        let reservationsHtml = `
            <div class="print-page print-reservations-page">
                <div class="print-reservations">
                    <h3>Reservations (${reservations.length})</h3>
        `;

        reservations.forEach(reservation => {
            const status = getReservationStatusLabel(reservation.status);
            const statusClass = status.toLowerCase();
            
            reservationsHtml += `
                <div class="reservation-item">
                    <div class="reservation-header">
                        <div class="reservation-guest">
                            <div class="reservation-guest-name">${reservation.contactName || 'Guest'}</div>
                            <div class="reservation-guest-dates">${formatDate(reservation.startDate)} → ${formatDate(reservation.endDate)}</div>
                        </div>
                        <span class="reservation-status ${statusClass}">${status}</span>
                    </div>
                    <div class="reservation-details">
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">Start Date</div>
                            <div class="reservation-detail-value">${formatDate(reservation.startDate)}</div>
                        </div>
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">End Date</div>
                            <div class="reservation-detail-value">${formatDate(reservation.endDate)}</div>
                        </div>
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">Duration</div>
                            <div class="reservation-detail-value">${getReservationDuration(reservation)}</div>
                        </div>
                        ${reservation.totalAmount !== null && reservation.totalAmount !== undefined ? `
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">Amount</div>
                            <div class="reservation-detail-value">${formatAmount(reservation.totalAmount)}</div>
                        </div>
                        ` : ''}
                        ${reservation.contactEmail ? `
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">Email</div>
                            <div class="reservation-detail-value">${reservation.contactEmail}</div>
                        </div>
                        ` : ''}
                        ${reservation.contactPhone ? `
                        <div class="reservation-detail-item">
                            <div class="reservation-detail-label">Phone</div>
                            <div class="reservation-detail-value">${reservation.contactPhone}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        reservationsHtml += `
                </div>
            </div>
        `;

        return reservationsHtml;
    }

    /**
     * Create footer
     */
    private _createFooter(): string
    {
        const currentYear = new Date().getFullYear();
        return `
            <div class="print-footer">
                <p>ImmoGest CRM &copy; ${currentYear} - Generated on ${new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
            </div>
        `;
    }
}

