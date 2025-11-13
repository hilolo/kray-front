import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, inject, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReservationService } from '../reservation.service';
import { Reservation, CalendarEvent, ReservationStatus, getReservationStatusLabel } from '../reservation.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { NoDataComponent } from 'app/shared/components/no-data/no-data.component';
import { PropertyService } from '../../property/property.service';
import { Property } from '../../property/property.types';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact } from '../../contacts/contacts.types';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { PAGINATION_CONFIG } from 'app/core/constants/pagination.constants';

@Component({
    selector: 'reservation-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTableModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatCardModule,
        MatMenuModule,
        NoDataComponent
    ]
})
export class ReservationListComponent implements OnInit, OnDestroy {
    @ViewChildren('reservationCard') reservationCards: QueryList<ElementRef>;
    
    reservations: Reservation[] = [];
    isLoading: boolean = false;
    searchInputControl: FormGroup;
    
    // View mode: 'list' or 'calendar'
    viewMode: 'list' | 'calendar' = 'list';
    
    // Pagination
    currentPage: number = 1;
    pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    totalItems: number = 0;
    totalPages: number = 0;
    pageSizeOptions: number[] = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;
    
    // Table configuration
    displayedColumns: string[] = ['property', 'tenant', 'arrival', 'departure', 'nights', 'amount', 'actions'];
    
    // Calendar configuration
    currentDate: Date = new Date();
    currentMonth: number = new Date().getMonth();
    currentYear: number = new Date().getFullYear();
    calendarDays: CalendarDay[] = [];
    calendarEvents: CalendarEvent[] = [];
    reservationColors: Map<string, string> = new Map();
    
    // Predefined color palette for reservations
    colorPalette: string[] = [
        '#3b82f6', // Blue
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#06b6d4', // Cyan
        '#84cc16', // Lime
        '#f97316', // Orange
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#a855f7', // Purple
        '#f43f5e', // Rose
        '#22c55e', // Green
        '#eab308', // Yellow
        '#0ea5e9', // Sky
        '#d946ef', // Fuchsia
        '#64748b', // Slate
    ];
    
    // Selected reservation tracking
    selectedReservationId: string | null = null;
    
    // Filters
    properties: Property[] = [];
    filteredProperties: Property[] = [];
    selectedPropertyId: string | null = null;
    propertySearchTerm: string = '';
    showPropertyDropdown: boolean = false;
    isEditingProperty: boolean = false;
    
    // Contact/Tenant filter
    tenants: Contact[] = [];
    filteredTenants: Contact[] = [];
    selectedTenantId: string | null = null;
    tenantSearchTerm: string = '';
    showTenantDropdown: boolean = false;
    isEditingTenant: boolean = false;
    
    // Date filter
    selectedDateFilter: string = 'thisMonth';
    showDateDropdown: boolean = false;
    
    dateFilterOptions = [
        { value: 'thisMonth', label: 'This Month' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: '7days', label: 'Last 7 Days' },
        { value: '30days', label: 'Last 30 Days' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'thisYear', label: 'Current Year' },
        { value: 'lastYear', label: 'Last Year' }
    ];
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    // Inject services
    private _formBuilder = inject(FormBuilder);
    private _reservationService = inject(ReservationService);
    private _propertyService = inject(PropertyService);
    private _contactsService = inject(ContactsService);
    private _router = inject(Router);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _errorHandlerService = inject(ErrorHandlerService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _appConfigService = inject(AppConfigService);

    ngOnInit(): void {
        // Load saved view preference using AppConfigService
        this.viewMode = this._appConfigService.getReservationViewPreference();
        
        // Initialize search form
        this.searchInputControl = this._formBuilder.group({
            searchQuery: ['']
        });

        // Subscribe to search query changes
        this.searchInputControl.get('searchQuery').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.currentPage = 1;
                this.loadReservations();
            });

        // Load properties and tenants for filter
        this.loadProperties();
        this.loadTenants();
        
        // Initialize calendar if in calendar view
        if (this.viewMode === 'calendar') {
            this.generateCalendar();
        }
        
        // Load initial data
        this.loadReservations();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Load properties (vacation rentals only)
     */
    loadProperties(): void {
        this._propertyService.getProperties({
            currentPage: 1,
            pageSize: 1000,
            ignore: true,
            searchQuery: '',
            category: 2 // PropertyCategory.LocationVacances
        }).subscribe({
            next: (result) => {
                this.properties = result.result || [];
                this.filteredProperties = result.result || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading properties:', error);
                this.properties = [];
                this.filteredProperties = [];
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load properties');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load tenants
     */
    loadTenants(): void {
        this._contactsService.getContactsByType('tenant', 1, 1000, true).subscribe({
            next: (contacts) => {
                this.tenants = contacts || [];
                this.filteredTenants = contacts || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading tenants:', error);
                this.tenants = [];
                this.filteredTenants = [];
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load tenants');
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Load reservations
     */
    loadReservations(): void {
        this.isLoading = true;
        const searchQuery = this.searchInputControl.get('searchQuery').value;
        const dateRange = this.getDateRange();

        this._reservationService.getReservations({
            currentPage: this.currentPage,
            pageSize: this.viewMode === 'calendar' ? 1000 : this.pageSize,
            searchQuery: searchQuery || '',
            ignore: true,
            contactId: this.selectedTenantId,
            propertyId: this.selectedPropertyId,
            startDateFrom: dateRange.startDate,
            startDateTo: dateRange.endDate
        }).subscribe({
            next: (result) => {
                this.reservations = result.result;
                this.totalItems = result.totalItems;
                this.totalPages = result.totalPages;
                this.currentPage = result.currentPage;
                
                // Update calendar events if in calendar view
                if (this.viewMode === 'calendar') {
                    this.updateCalendarEvents();
                }
                
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error loading reservations:', error);
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load reservations');
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Filter properties
     */
    filterProperties(): void {
        const searchTerm = this.propertySearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredProperties = [...this.properties];
        } else {
            this.filteredProperties = this.properties.filter(property => 
                property.name?.toLowerCase().includes(searchTerm) ||
                property.identifier?.toLowerCase().includes(searchTerm) ||
                property.address?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle property input events
     */
    onPropertyInput(event: any): void {
        const value = event.target.value;
        this.propertySearchTerm = value;
        this.isEditingProperty = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedPropertyId !== null) {
                this.selectedPropertyId = null;
                this.currentPage = 1;
                this.loadReservations();
            }
        }
        
        this.filterProperties();
    }

    /**
     * Handle property focus
     */
    onPropertyFocus(): void {
        // Clear search term to show all properties
        this.propertySearchTerm = '';
        this.isEditingProperty = true;
        this.showPropertyDropdown = true;
        this.filterProperties();
    }

    /**
     * Handle property blur
     */
    onPropertyBlur(): void {
        setTimeout(() => {
            this.showPropertyDropdown = false;
            this.isEditingProperty = false;
            // Clear search term for next time
            this.propertySearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    /**
     * Filter tenants
     */
    filterTenants(): void {
        const searchTerm = this.tenantSearchTerm.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredTenants = [...this.tenants];
        } else {
            this.filteredTenants = this.tenants.filter(tenant => 
                tenant.name?.toLowerCase().includes(searchTerm) ||
                tenant.identifier?.toLowerCase().includes(searchTerm) ||
                tenant.email?.toLowerCase().includes(searchTerm) ||
                tenant.firstName?.toLowerCase().includes(searchTerm) ||
                tenant.lastName?.toLowerCase().includes(searchTerm)
            );
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle tenant input events
     */
    onTenantInput(event: any): void {
        const value = event.target.value;
        this.tenantSearchTerm = value;
        this.isEditingTenant = true;
        
        // If the input is cleared completely, remove the selection
        if (!value || value.trim() === '') {
            if (this.selectedTenantId !== null) {
                this.selectedTenantId = null;
                this.currentPage = 1;
                this.loadReservations();
            }
        }
        
        this.filterTenants();
    }

    /**
     * Handle tenant focus
     */
    onTenantFocus(): void {
        // Clear search term to show all tenants
        this.tenantSearchTerm = '';
        this.isEditingTenant = true;
        this.showTenantDropdown = true;
        this.filterTenants();
    }

    /**
     * Handle tenant blur
     */
    onTenantBlur(): void {
        setTimeout(() => {
            this.showTenantDropdown = false;
            this.isEditingTenant = false;
            // Clear search term for next time
            this.tenantSearchTerm = '';
            this._changeDetectorRef.markForCheck();
        }, 200);
    }

    /**
     * Select property filter
     */
    selectProperty(propertyId: string | null): void {
        this.selectedPropertyId = propertyId;
        this.propertySearchTerm = ''; // Clear search term to show selected property name
        this.isEditingProperty = false;
        this.showPropertyDropdown = false;
        this.currentPage = 1;
        this.loadReservations();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected property name
     */
    getSelectedPropertyName(): string {
        if (!this.selectedPropertyId) {
            return 'All Properties';
        }
        const property = this.properties.find(p => p.id === this.selectedPropertyId);
        return property ? property.name : 'All Properties';
    }

    /**
     * Clear property filter
     */
    clearPropertyFilter(): void {
        this.selectProperty(null);
    }

    /**
     * Select tenant filter
     */
    selectTenant(tenantId: string | null): void {
        this.selectedTenantId = tenantId;
        this.tenantSearchTerm = ''; // Clear search term to show selected tenant name
        this.isEditingTenant = false;
        this.showTenantDropdown = false;
        this.currentPage = 1;
        this.loadReservations();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected tenant name
     */
    getSelectedTenantName(): string {
        if (!this.selectedTenantId) {
            return 'All Tenants';
        }
        const tenant = this.tenants.find(t => t.id === this.selectedTenantId);
        return tenant ? tenant.name : 'All Tenants';
    }

    /**
     * Clear tenant filter
     */
    clearTenantFilter(): void {
        this.selectTenant(null);
    }

    /**
     * Clear all filters
     */
    clearAllFilters(): void {
        this.selectedPropertyId = null;
        this.selectedTenantId = null;
        this.selectedDateFilter = 'thisMonth';
        this.propertySearchTerm = '';
        this.tenantSearchTerm = '';
        this.currentPage = 1;
        this.loadReservations();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if any filters are active
     */
    hasActiveFilters(): boolean {
        return this.selectedPropertyId !== null || 
               this.selectedTenantId !== null || 
               this.selectedDateFilter !== 'thisMonth';
    }

    /**
     * Select date filter
     */
    selectDateFilter(filter: string): void {
        this.selectedDateFilter = filter;
        this.showDateDropdown = false;
        this.currentPage = 1;
        this.loadReservations();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get selected date filter label
     */
    getSelectedDateFilterLabel(): string {
        const option = this.dateFilterOptions.find(opt => opt.value === this.selectedDateFilter);
        return option ? option.label : 'This Month';
    }

    /**
     * Get date range for filter
     */
    getDateRange(): { startDate: string | null; endDate: string | null } {
        // In calendar view, use the calendar's current month/year
        if (this.viewMode === 'calendar') {
            const startDate = new Date(this.currentYear, this.currentMonth, 1);
            const endDate = new Date(this.currentYear, this.currentMonth + 1, 0, 23, 59, 59, 999);
            return {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };
        }

        // In list view, use the selected date filter
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        switch (this.selectedDateFilter) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                startDate = new Date(yesterday.setHours(0, 0, 0, 0));
                endDate = new Date(yesterday.setHours(23, 59, 59, 999));
                break;
            case '7days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
                break;
            case '30days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 30);
                endDate = new Date();
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
        }

        return {
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null
        };
    }

    /**
     * Get filtered reservations for list view
     */
    getFilteredReservations(): Reservation[] {
        return this.reservations;
    }

    /**
     * Handle page change
     */
    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadReservations();
    }

    /**
     * Create new reservation
     */
    createReservation(): void {
        this._router.navigate(['/reservation/add']);
    }

    /**
     * Edit reservation
     */
    editReservation(reservation: Reservation): void {
        this._router.navigate(['/reservation', reservation.id]);
    }

    /**
     * Delete reservation
     */
    deleteReservation(reservation: Reservation, event: Event): void {
        event.stopPropagation();

        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Reservation',
            message: `Are you sure you want to delete the reservation for ${reservation.contactName}? This action cannot be undone.`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Delete',
                    color: 'warn'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._reservationService.deleteReservation(reservation.id).subscribe({
                    next: () => {
                        this._errorHandlerService.showSuccessAlert('Success', 'Reservation deleted successfully');
                        this.loadReservations();
                    },
                    error: (error) => {
                        this._errorHandlerService.showErrorAlert('Error', 'Failed to delete reservation');
                        console.error('Error deleting reservation:', error);
                    }
                });
            }
        });
    }


    /**
     * Switch view mode
     */
    switchView(mode: 'list' | 'calendar'): void {
        this.viewMode = mode;
        
        // Save view preference using AppConfigService
        this._appConfigService.setReservationViewPreference(mode);
        
        if (mode === 'calendar') {
            this.generateCalendar();
            this.updateCalendarEvents();
        }
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Generate calendar days
     */
    generateCalendar(): void {
        this.calendarDays = [];
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
        
        const firstDayOfWeek = firstDay.getDay();
        const lastDateOfMonth = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        // Previous month days
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            this.calendarDays.push({
                date: new Date(this.currentYear, this.currentMonth - 1, prevLastDate - i),
                isCurrentMonth: false,
                isToday: false,
                events: []
            });
        }
        
        // Current month days
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const date = new Date(this.currentYear, this.currentMonth, i);
            const today = new Date();
            this.calendarDays.push({
                date: date,
                isCurrentMonth: true,
                isToday: date.toDateString() === today.toDateString(),
                events: []
            });
        }
        
        // Next month days to fill the grid
        const remainingDays = 42 - this.calendarDays.length;
        for (let i = 1; i <= remainingDays; i++) {
            this.calendarDays.push({
                date: new Date(this.currentYear, this.currentMonth + 1, i),
                isCurrentMonth: false,
                isToday: false,
                events: []
            });
        }
    }

    /**
     * Update calendar events from reservations
     */
    updateCalendarEvents(): void {
        // Clear all existing events from calendar days first
        this.calendarDays.forEach(day => {
            day.events = [];
        });
        
        // Filter out cancelled reservations from calendar
        const activeReservations = this.reservations.filter(reservation => {
            const status = this._parseReservationStatus(reservation.status);
            return status !== ReservationStatus.Cancelled;
        });
        
        this.calendarEvents = activeReservations.map((reservation, index) => {
            // For calendar display, extend end date by 1 day to show checkout morning
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            // Add 1 day to end date for calendar display (checkout is in the morning of the next day)
            const displayEndDate = new Date(endDate);
            displayEndDate.setDate(displayEndDate.getDate() + 1);
            
            return {
                id: reservation.id,
                title: `${reservation.contactName}`,
                startDate: startDate,
                endDate: displayEndDate, // Use extended end date for calendar display
                color: this.getReservationColor(reservation.id, index),
                reservation: reservation
            };
        });
        
        // Assign events to calendar days with position information
        this.calendarDays.forEach(day => {
            day.events = this.calendarEvents
                .filter(event => {
                    // Normalize dates to compare only dates (not time)
                    const dayDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                    const eventStart = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
                    const eventEnd = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
                    
                    return dayDate >= eventStart && dayDate <= eventEnd;
                })
                .map(event => {
                    // Normalize dates to compare only dates (not time)
                    const dayDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                    const eventStart = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate());
                    const eventEnd = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate());
                    
                    const isStartDay = dayDate.getTime() === eventStart.getTime();
                    const isEndDay = dayDate.getTime() === eventEnd.getTime();
                    const isMiddleDay = !isStartDay && !isEndDay;
                    
                    return {
                        ...event,
                        isStartDay,
                        isEndDay,
                        isMiddleDay
                    };
                });
        });
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get or assign a unique color for a reservation
     */
    getReservationColor(reservationId: string, index: number): string {
        if (!this.reservationColors.has(reservationId)) {
            const colorIndex = index % this.colorPalette.length;
            this.reservationColors.set(reservationId, this.colorPalette[colorIndex]);
        }
        return this.reservationColors.get(reservationId);
    }

    /**
     * Check if reservation is pending
     */
    isPendingReservation(reservation: Reservation): boolean {
        const status = this._parseReservationStatus(reservation.status);
        return status === ReservationStatus.Pending;
    }

    /**
     * Parse reservation status
     */
    private _parseReservationStatus(status: ReservationStatus | string | number | null | undefined): ReservationStatus | null {
        if (status === null || status === undefined) {
            return null;
        }
        
        if (typeof status === 'number') {
            return status as ReservationStatus;
        }
        
        if (typeof status === 'string') {
            const statusNum = parseInt(status, 10);
            if (!isNaN(statusNum)) {
                return statusNum as ReservationStatus;
            }
            
            // Try matching by enum name
            const enumKey = Object.keys(ReservationStatus).find(key => 
                key.toLowerCase() === status.toLowerCase()
            ) as keyof typeof ReservationStatus;
            
            if (enumKey && ReservationStatus[enumKey] !== undefined) {
                return ReservationStatus[enumKey] as ReservationStatus;
            }
        }
        
        return null;
    }

    /**
     * Get reservation status label
     */
    getReservationStatusLabel(status: ReservationStatus | string | number | null | undefined): string {
        return getReservationStatusLabel(status);
    }

    /**
     * Get reservation status badge class
     */
    getReservationStatusBadgeClass(status: ReservationStatus | string | number | null | undefined): string {
        const statusNum = this._parseReservationStatus(status);
        
        if (statusNum === null) {
            return 'bg-gray-500';
        }
        
        switch (statusNum) {
            case ReservationStatus.Pending:
                return 'bg-yellow-500';
            case ReservationStatus.Approved:
                return 'bg-green-500';
            case ReservationStatus.Cancelled:
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    }

    /**
     * Get reservation status icon
     */
    getReservationStatusIcon(status: ReservationStatus | string | number | null | undefined): string | null {
        const statusNum = this._parseReservationStatus(status);
        
        if (statusNum === null) {
            return null;
        }
        
        switch (statusNum) {
            case ReservationStatus.Pending:
                return 'heroicons_outline:clock';
            case ReservationStatus.Approved:
                return 'heroicons_outline:check-circle';
            case ReservationStatus.Cancelled:
                return 'heroicons_outline:ban';
            default:
                return null;
        }
    }

    /**
     * Check if a date is the start or end day of a reservation
     */
    isReservationStartOrEndDay(date: Date, reservation: Reservation): boolean {
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const startDate = new Date(reservation.startDate);
        const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        
        const endDate = new Date(reservation.endDate);
        const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        return checkDate.getTime() === normalizedStart.getTime() || checkDate.getTime() === normalizedEnd.getTime();
    }

    /**
     * Check if a date is the start day of a reservation
     */
    isReservationStartDay(date: Date, reservation: Reservation): boolean {
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const startDate = new Date(reservation.startDate);
        const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        
        return checkDate.getTime() === normalizedStart.getTime();
    }

    /**
     * Update reservation status
     */
    updateStatus(reservation: Reservation, status: ReservationStatus): void {
        this._reservationService.updateReservationStatus(reservation.id, status).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert('Success', 'Status updated successfully');
                // Update the reservation status in local array immediately
                const index = this.reservations.findIndex(r => r.id === reservation.id);
                if (index !== -1) {
                    this.reservations[index].status = status;
                }
                // Refresh calendar events if in calendar view
                if (this.viewMode === 'calendar') {
                    this.updateCalendarEvents();
                }
                // Reload reservations to get fresh data
                this.loadReservations();
            },
            error: (error) => {
                console.error('Error updating status:', error);
                this._errorHandlerService.showErrorAlert('Error', 'Failed to update status');
            }
        });
    }

    /**
     * Get reservations for the current month being viewed
     */
    getCurrentMonthReservations(): Reservation[] {
        return this.reservations.filter(reservation => {
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            
            // Check if reservation overlaps with current month
            const monthStart = new Date(this.currentYear, this.currentMonth, 1);
            const monthEnd = new Date(this.currentYear, this.currentMonth + 1, 0);
            
            return (startDate <= monthEnd && endDate >= monthStart);
        });
    }

    /**
     * Get color for a specific reservation by ID
     */
    getColorForReservation(reservationId: string): string {
        return this.reservationColors.get(reservationId) || '#3b82f6';
    }

    /**
     * Calculate number of nights for a reservation
     */
    calculateNights(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Navigate to previous month
     */
    previousMonth(): void {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.generateCalendar();
        // Reload reservations for the new month
        this.loadReservations();
    }

    /**
     * Navigate to next month
     */
    nextMonth(): void {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.generateCalendar();
        // Reload reservations for the new month
        this.loadReservations();
    }

    /**
     * Go to today
     */
    goToToday(): void {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
        this.generateCalendar();
        // Reload reservations for the current month
        this.loadReservations();
    }

    /**
     * Get month name
     */
    getMonthName(): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[this.currentMonth];
    }

    /**
     * Select a reservation (highlight in calendar and sidebar)
     */
    selectReservation(reservationId: string, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        
        // Toggle selection - if already selected, deselect
        if (this.selectedReservationId === reservationId) {
            this.selectedReservationId = null;
        } else {
            this.selectedReservationId = reservationId;
            
            // Scroll to the selected reservation in the sidebar
            setTimeout(() => {
                const selectedCard = this.reservationCards?.find(
                    (card) => card.nativeElement.getAttribute('data-reservation-id') === reservationId
                );
                
                if (selectedCard) {
                    selectedCard.nativeElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        }
        
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if a reservation is selected
     */
    isReservationSelected(reservationId: string): boolean {
        return this.selectedReservationId === reservationId;
    }

    /**
     * Track by function for ngFor loops
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

// Calendar day interface
interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

