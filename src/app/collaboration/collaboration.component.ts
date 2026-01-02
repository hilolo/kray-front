import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZardPageComponent } from '../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { PropertyCategory, TypePaiment } from '@shared/models/property/property.model';
import { CollaborationService } from '@shared/services/collaboration.service';
import type { CollaborationProperty } from '@shared/models/collaboration/collaboration-property.model';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardComboboxComponent,
    ZardDatePickerComponent,
    TranslateModule,
    FormsModule,
    PropertyPricePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collaboration.component.html',
})
export class CollaborationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly collaborationService = inject(CollaborationService);
  private readonly destroy$ = new Subject<void>();

  readonly currentPage = signal(1);
  readonly pageSize = signal(33); // Default page size
  readonly properties = signal<CollaborationProperty[]>([]);
  readonly isLoading = signal(false);
  
  // Filters
  readonly selectedCategory = signal<PropertyCategory | null>(null);
  readonly categoryOptions = signal<ZardComboboxOption[]>([]);
  readonly minPrice = signal<string | null>(null);
  readonly maxPrice = signal<string | null>(null);
  readonly minArea = signal<string | null>(null);
  readonly maxArea = signal<string | null>(null);
  readonly selectedBedrooms = signal<string | null>(null);
  readonly bedroomsOptions = signal<ZardComboboxOption[]>([]);
  readonly collaborationDateFrom = signal<Date | null>(null);
  readonly collaborationDateTo = signal<Date | null>(null);
  
  // Filter panel states
  readonly isPricePanelOpen = signal(false);
  readonly isSurfacePanelOpen = signal(false);
  readonly isBedroomsPanelOpen = signal(false);
  readonly isDatePanelOpen = signal(false);
  
  // Price options
  readonly priceOptions = signal<ZardComboboxOption[]>([
    { value: '', label: 'Indifférent' },
    { value: '1000', label: '1 000 DH' },
    { value: '2000', label: '2 000 DH' },
    { value: '3000', label: '3 000 DH' },
    { value: '4000', label: '4 000 DH' },
    { value: '5000', label: '5 000 DH' },
    { value: '6000', label: '6 000 DH' },
    { value: '7000', label: '7 000 DH' },
    { value: '8000', label: '8 000 DH' },
    { value: '9000', label: '9 000 DH' },
    { value: '10000', label: '10 000 DH' },
    { value: '15000', label: '15 000 DH' },
    { value: '20000', label: '20 000 DH' },
    { value: '25000', label: '25 000 DH' },
    { value: '30000', label: '30 000 DH' },
    { value: '40000', label: '40 000 DH' },
    { value: '50000', label: '50 000 DH' },
  ]);
  
  // Surface options
  readonly surfaceOptions = signal<ZardComboboxOption[]>([
    { value: '', label: 'Indifférent' },
    { value: '30', label: '30 m²' },
    { value: '50', label: '50 m²' },
    { value: '75', label: '75 m²' },
    { value: '100', label: '100 m²' },
    { value: '120', label: '120 m²' },
    { value: '150', label: '150 m²' },
    { value: '200', label: '200 m²' },
    { value: '250', label: '250 m²' },
    { value: '300', label: '300 m²' },
    { value: '400', label: '400 m²' },
    { value: '500', label: '500 m²' },
  ]);
  
  // Image navigation for each property card
  readonly currentImageIndices = signal<Map<string, number>>(new Map());
  
  // Favorites stored in localStorage
  private readonly FAVORITES_STORAGE_KEY = 'collaboration_favorites';
  readonly favoritePropertyIds = signal<Set<string>>(new Set());

  readonly filteredProperties = computed(() => {
    let filtered = this.properties();
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== null) {
      filtered = filtered.filter(prop => prop.category === category);
    }
    
    // Filter by price range
    const minPrice = this.minPrice();
    const maxPrice = this.maxPrice();
    if (minPrice && minPrice !== '') {
      const minPriceNum = parseFloat(minPrice);
      filtered = filtered.filter(prop => prop.price >= minPriceNum);
    }
    if (maxPrice && maxPrice !== '') {
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(prop => prop.price <= maxPriceNum);
    }
    
    // Filter by area range
    const minArea = this.minArea();
    const maxArea = this.maxArea();
    if (minArea && minArea !== '') {
      const minAreaNum = parseFloat(minArea);
      filtered = filtered.filter(prop => prop.area >= minAreaNum);
    }
    if (maxArea && maxArea !== '') {
      const maxAreaNum = parseFloat(maxArea);
      filtered = filtered.filter(prop => prop.area <= maxAreaNum);
    }
    
    // Filter by bedrooms
    const bedrooms = this.selectedBedrooms();
    if (bedrooms && bedrooms !== '') {
      const bedroomsNum = parseInt(bedrooms, 10);
      filtered = filtered.filter(prop => prop.pieces >= bedroomsNum);
    }
    
    // Filter by collaboration date
    const dateFrom = this.collaborationDateFrom();
    const dateTo = this.collaborationDateTo();
    if (dateFrom) {
      filtered = filtered.filter(prop => {
        if (!prop.collaborationAt) return false;
        const propDate = new Date(prop.collaborationAt);
        return propDate >= dateFrom;
      });
    }
    if (dateTo) {
      filtered = filtered.filter(prop => {
        if (!prop.collaborationAt) return false;
        const propDate = new Date(prop.collaborationAt);
        // Set time to end of day for inclusive comparison
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        return propDate <= endOfDay;
      });
    }
    
    // Apply pagination
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly paginatedInfo = computed(() => {
    let filtered = this.properties();
    
    // Apply same filters for total count
    const category = this.selectedCategory();
    if (category !== null) {
      filtered = filtered.filter(prop => prop.category === category);
    }
    
    const minPrice = this.minPrice();
    const maxPrice = this.maxPrice();
    if (minPrice && minPrice !== '') {
      const minPriceNum = parseFloat(minPrice);
      filtered = filtered.filter(prop => prop.price >= minPriceNum);
    }
    if (maxPrice && maxPrice !== '') {
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(prop => prop.price <= maxPriceNum);
    }
    
    const minArea = this.minArea();
    const maxArea = this.maxArea();
    if (minArea && minArea !== '') {
      const minAreaNum = parseFloat(minArea);
      filtered = filtered.filter(prop => prop.area >= minAreaNum);
    }
    if (maxArea && maxArea !== '') {
      const maxAreaNum = parseFloat(maxArea);
      filtered = filtered.filter(prop => prop.area <= maxAreaNum);
    }
    
    const bedrooms = this.selectedBedrooms();
    if (bedrooms && bedrooms !== '') {
      const bedroomsNum = parseInt(bedrooms, 10);
      filtered = filtered.filter(prop => prop.pieces >= bedroomsNum);
    }
    
    // Filter by collaboration date
    const dateFrom = this.collaborationDateFrom();
    const dateTo = this.collaborationDateTo();
    if (dateFrom) {
      filtered = filtered.filter(prop => {
        if (!prop.collaborationAt) return false;
        const propDate = new Date(prop.collaborationAt);
        return propDate >= dateFrom;
      });
    }
    if (dateTo) {
      filtered = filtered.filter(prop => {
        if (!prop.collaborationAt) return false;
        const propDate = new Date(prop.collaborationAt);
        // Set time to end of day for inclusive comparison
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        return propDate <= endOfDay;
      });
    }
    
    const total = filtered.length;
    const start = total > 0 ? (this.currentPage() - 1) * this.pageSize() + 1 : 0;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return { start, end, total };
  });

  readonly totalPages = computed(() => {
    const total = this.paginatedInfo().total;
    return total > 0 ? Math.ceil(total / this.pageSize()) : 1;
  });

  // Effect to reset to page 1 if current page exceeds total pages (e.g., after filtering)
  constructor() {
    // Reset page if it exceeds total pages
    effect(() => {
      const current = this.currentPage();
      const total = this.totalPages();
      if (current > total && total > 0) {
        this.currentPage.set(1);
      }
    });
  }
  
  readonly sharedWithCompany = computed(() => {
    // Extract company name from properties
    return (property: CollaborationProperty) => property.companyName || '';
  });

  readonly emptyMessage = computed(() => {
    const hasFilters = this.selectedCategory() !== null || 
                      this.minPrice() !== null || 
                      this.maxPrice() !== null || 
                      this.minArea() !== null || 
                      this.maxArea() !== null || 
                      this.selectedBedrooms() !== null;
    
    if (hasFilters) {
      return this.translateService.instant('collaboration.emptySearch');
    }
    return this.translateService.instant('collaboration.empty');
  });

  readonly hasActiveFilters = computed(() => {
    return this.selectedCategory() !== null || 
           (this.minPrice() !== null && this.minPrice() !== '') || 
           (this.maxPrice() !== null && this.maxPrice() !== '') || 
           (this.minArea() !== null && this.minArea() !== '') || 
           (this.maxArea() !== null && this.maxArea() !== '') || 
           (this.selectedBedrooms() !== null && this.selectedBedrooms() !== '') ||
           this.collaborationDateFrom() !== null ||
           this.collaborationDateTo() !== null;
  });

  readonly hasData = computed(() => {
    return this.filteredProperties().length > 0;
  });

  ngOnInit(): void {
    // Initialize filter options
    this.loadCategoryOptions();
    this.loadBedroomsOptions();
    
    // Load favorites from localStorage
    this.loadFavorites();
    
    // Load collaboration properties from API
    this.loadCollaborationProperties();
  }

  loadFavorites(): void {
    try {
      const stored = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites = JSON.parse(stored) as string[];
        this.favoritePropertyIds.set(new Set(favorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }

  saveFavorites(): void {
    try {
      const favoritesArray = Array.from(this.favoritePropertyIds());
      localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  toggleFavorite(propertyId: string, event: Event): void {
    event.stopPropagation();
    const favorites = new Set(this.favoritePropertyIds());
    if (favorites.has(propertyId)) {
      favorites.delete(propertyId);
    } else {
      favorites.add(propertyId);
    }
    this.favoritePropertyIds.set(favorites);
    this.saveFavorites();
  }

  isFavorite(propertyId: string): boolean {
    return this.favoritePropertyIds().has(propertyId);
  }

  loadCollaborationProperties(): void {
    this.isLoading.set(true);
    this.collaborationService.getCollaborationProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.properties.set(properties);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading collaboration properties:', error);
          this.isLoading.set(false);
          this.properties.set([]);
        }
      });
  }

  loadCategoryOptions(): void {
    const options: ZardComboboxOption[] = [
      { value: PropertyCategory.Location.toString(), label: this.translateService.instant('property.categories.location') },
      { value: PropertyCategory.Vente.toString(), label: this.translateService.instant('property.categories.vente') },
      { value: PropertyCategory.LocationVacances.toString(), label: this.translateService.instant('property.categories.locationVacances') },
    ];
    this.categoryOptions.set(options);
  }

  loadBedroomsOptions(): void {
    const options: ZardComboboxOption[] = [
      { value: '', label: 'Indifférent' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6+' },
    ];
    this.bedroomsOptions.set(options);
  }

  onCategoryChange(categoryId: string | null): void {
    const category = categoryId !== null ? +categoryId as PropertyCategory : null;
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  togglePricePanel(): void {
    this.isPricePanelOpen.set(!this.isPricePanelOpen());
    // Close other panels
    if (this.isPricePanelOpen()) {
      this.isSurfacePanelOpen.set(false);
      this.isBedroomsPanelOpen.set(false);
      this.isDatePanelOpen.set(false);
    }
  }

  toggleSurfacePanel(): void {
    this.isSurfacePanelOpen.set(!this.isSurfacePanelOpen());
    // Close other panels
    if (this.isSurfacePanelOpen()) {
      this.isPricePanelOpen.set(false);
      this.isBedroomsPanelOpen.set(false);
      this.isDatePanelOpen.set(false);
    }
  }

  toggleBedroomsPanel(): void {
    this.isBedroomsPanelOpen.set(!this.isBedroomsPanelOpen());
    // Close other panels
    if (this.isBedroomsPanelOpen()) {
      this.isPricePanelOpen.set(false);
      this.isSurfacePanelOpen.set(false);
      this.isDatePanelOpen.set(false);
    }
  }

  toggleDatePanel(): void {
    this.isDatePanelOpen.set(!this.isDatePanelOpen());
    // Close other panels
    if (this.isDatePanelOpen()) {
      this.isPricePanelOpen.set(false);
      this.isSurfacePanelOpen.set(false);
      this.isBedroomsPanelOpen.set(false);
    }
  }

  onMinPriceChange(value: string | null): void {
    this.minPrice.set(value === '' ? null : value);
    this.currentPage.set(1);
    // Close panel after selection
    this.isPricePanelOpen.set(false);
  }

  onMaxPriceChange(value: string | null): void {
    this.maxPrice.set(value === '' ? null : value);
    this.currentPage.set(1);
    // Close panel after selection
    this.isPricePanelOpen.set(false);
  }

  onMinAreaChange(value: string | null): void {
    this.minArea.set(value === '' ? null : value);
    this.currentPage.set(1);
    // Close panel after selection
    this.isSurfacePanelOpen.set(false);
  }

  onMaxAreaChange(value: string | null): void {
    this.maxArea.set(value === '' ? null : value);
    this.currentPage.set(1);
    // Close panel after selection
    this.isSurfacePanelOpen.set(false);
  }

  onBedroomsChange(bedroomsId: string | null): void {
    this.selectedBedrooms.set(bedroomsId === '' ? null : bedroomsId);
    this.currentPage.set(1);
    // Close panel after selection
    this.isBedroomsPanelOpen.set(false);
  }

  onDateFromChange(date: Date | null): void {
    this.collaborationDateFrom.set(date);
    this.currentPage.set(1);
    // Close panel after selection
    if (date) {
      this.isDatePanelOpen.set(false);
    }
  }

  onDateToChange(date: Date | null): void {
    this.collaborationDateTo.set(date);
    this.currentPage.set(1);
    // Close panel after selection
    if (date) {
      this.isDatePanelOpen.set(false);
    }
  }

  getDateLabel(): string {
    const from = this.collaborationDateFrom();
    const to = this.collaborationDateTo();
    if (!from && !to) return this.translateService.instant('collaboration.filters.date');
    if (from && to) {
      return `${this.formatDateForLabel(from)} - ${this.formatDateForLabel(to)}`;
    }
    if (from) {
      return `${this.formatDateForLabel(from)} +`;
    }
    if (to) {
      return `jusqu'à ${this.formatDateForLabel(to)}`;
    }
    return this.translateService.instant('collaboration.filters.date');
  }

  formatDateForLabel(date: Date): string {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  onResetFilters(): void {
    this.selectedCategory.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minArea.set(null);
    this.maxArea.set(null);
    this.selectedBedrooms.set(null);
    this.collaborationDateFrom.set(null);
    this.collaborationDateTo.set(null);
    this.isPricePanelOpen.set(false);
    this.isSurfacePanelOpen.set(false);
    this.isBedroomsPanelOpen.set(false);
    this.isDatePanelOpen.set(false);
    this.currentPage.set(1);
  }
  
  getPriceLabel(): string {
    const min = this.minPrice();
    const max = this.maxPrice();
    if (!min && !max) return this.translateService.instant('collaboration.filters.price');
    if (min && max) {
      const minOpt = this.priceOptions().find(o => o.value === min);
      const maxOpt = this.priceOptions().find(o => o.value === max);
      return `${minOpt?.label || min} - ${maxOpt?.label || max}`;
    }
    if (min) {
      const minOpt = this.priceOptions().find(o => o.value === min);
      return `${minOpt?.label || min} +`;
    }
    if (max) {
      const maxOpt = this.priceOptions().find(o => o.value === max);
      return `jusqu'à ${maxOpt?.label || max}`;
    }
    return this.translateService.instant('collaboration.filters.price');
  }
  
  getSurfaceLabel(): string {
    const min = this.minArea();
    const max = this.maxArea();
    if (!min && !max) return this.translateService.instant('collaboration.filters.surface');
    if (min && max) {
      const minOpt = this.surfaceOptions().find(o => o.value === min);
      const maxOpt = this.surfaceOptions().find(o => o.value === max);
      return `${minOpt?.label || min} - ${maxOpt?.label || max}`;
    }
    if (min) {
      const minOpt = this.surfaceOptions().find(o => o.value === min);
      return `${minOpt?.label || min} +`;
    }
    if (max) {
      const maxOpt = this.surfaceOptions().find(o => o.value === max);
      return `jusqu'à ${maxOpt?.label || max}`;
    }
    return this.translateService.instant('collaboration.filters.surface');
  }
  
  getBedroomsLabel(): string {
    const bedrooms = this.selectedBedrooms();
    if (!bedrooms || bedrooms === '') return this.translateService.instant('collaboration.filters.bedrooms');
    const opt = this.bedroomsOptions().find(o => o.value === bedrooms);
    return opt?.label || bedrooms;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  onViewProperty(property: CollaborationProperty, event?: Event): void {
    // Don't navigate if clicking on image navigation buttons
    if (event) {
      event.stopPropagation();
    }
    // Navigate to property detail - you can adjust this route later
    this.router.navigate(['/property/detail', property.id]);
  }

  getCurrentImageIndex(propertyId: string): number {
    return this.currentImageIndices().get(propertyId) || 0;
  }

  getCurrentImage(property: CollaborationProperty): string | null {
    const images = this.getPropertyImages(property);
    const index = this.getCurrentImageIndex(property.id);
    return images[index] || null;
  }

  getPropertyImages(property: CollaborationProperty): string[] {
    const images: string[] = [];
    if (property.defaultAttachmentUrl) {
      images.push(property.defaultAttachmentUrl);
    }
    if (property.attachments && property.attachments.length > 0) {
      property.attachments.forEach(att => {
        if (att.url && !images.includes(att.url)) {
          images.push(att.url);
        }
      });
    }
    return images;
  }

  nextImage(propertyId: string, event: Event): void {
    event.stopPropagation();
    const property = this.properties().find(p => p.id === propertyId);
    if (!property) return;
    
    const images = this.getPropertyImages(property);
    if (images.length <= 1) return;
    
    const currentIndex = this.getCurrentImageIndex(propertyId);
    const newIndex = (currentIndex + 1) % images.length;
    
    const newMap = new Map(this.currentImageIndices());
    newMap.set(propertyId, newIndex);
    this.currentImageIndices.set(newMap);
  }

  previousImage(propertyId: string, event: Event): void {
    event.stopPropagation();
    const property = this.properties().find(p => p.id === propertyId);
    if (!property) return;
    
    const images = this.getPropertyImages(property);
    if (images.length <= 1) return;
    
    const currentIndex = this.getCurrentImageIndex(propertyId);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    
    const newMap = new Map(this.currentImageIndices());
    newMap.set(propertyId, newIndex);
    this.currentImageIndices.set(newMap);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getVisiblePageNumbers(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    
    // Show up to 7 page numbers
    let start = Math.max(1, current - 3);
    let end = Math.min(total, start + 6);
    
    // Adjust start if we're near the end
    if (end - start < 6) {
      start = Math.max(1, end - 6);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPropertyDisplayName(property: CollaborationProperty): string {
    return property.name || property.identifier || this.translateService.instant('common.unnamedProperty');
  }

  getInitials(property: CollaborationProperty): string {
    const name = this.getPropertyDisplayName(property);
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  backToApp(): void {
    this.router.navigate(['/']);
  }

  callCompany(property: CollaborationProperty): void {
    if (property.companyPhone) {
      window.location.href = `tel:${property.companyPhone}`;
    }
  }

  contactViaWhatsApp(property: CollaborationProperty): void {
    if (property.companyPhone) {
      // Remove any non-numeric characters except +
      const phone = property.companyPhone.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${phone}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  contactViaEmail(property: CollaborationProperty): void {
    if (property.companyEmail) {
      window.location.href = `mailto:${property.companyEmail}`;
    }
  }
}

