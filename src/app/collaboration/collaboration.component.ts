import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ZardPageComponent } from '../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PropertyCategory } from '@shared/models/property/property.model';
import { CollaborationService } from '@shared/services/collaboration.service';
import { AuthService } from '@shared/services/auth.service';
import { PropertyService } from '@shared/services/property.service';
import { PropertyRequestService } from '@shared/services/property-request.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import type { Property } from '@shared/models/property/property.model';
import type { CollaborationProperty } from '@shared/models/collaboration/collaboration-property.model';
import type { CollaborationRequest } from '@shared/models/collaboration/collaboration-request.model';
import { CollaborationPropertyCardComponent } from './collaboration-property-card/collaboration-property-card.component';
import { CollaborationRequestCardComponent } from './collaboration-request-card/collaboration-request-card.component';

export type CollaborationViewType = 'properties' | 'requests';

@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardComboboxComponent,
    TranslateModule,
    FormsModule,
    CollaborationPropertyCardComponent,
    CollaborationRequestCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collaboration.component.html',
})
export class CollaborationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly collaborationService = inject(CollaborationService);
  private readonly authService = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly propertyRequestService = inject(PropertyRequestService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly toastService = inject(ToastService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  readonly currentCompanyId = computed(() => this.authService.currentUser()?.companyId ?? null);

  readonly currentPage = signal(1);
  readonly pageSize = signal(20); // Default page size
  readonly properties = signal<CollaborationProperty[]>([]);
  readonly requests = signal<CollaborationRequest[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingRequests = signal(false);
  readonly selectedViewType = signal<CollaborationViewType>('properties');
  private readonly requestsLoadedOnce = signal(false);

  readonly isMySharedPanelOpen = signal(false);
  readonly mySharedProperties = signal<Property[]>([]);
  readonly isLoadingMyShared = signal(false);
  readonly mySharedRequests = computed(() => {
    const companyId = this.currentCompanyId();
    if (!companyId) return [];
    return this.requests().filter(r => r.companyId === companyId);
  });

  // Filters
  readonly selectedCategory = signal<PropertyCategory | null>(null);
  readonly categoryOptions = signal<ZardComboboxOption[]>([]);
  readonly minPrice = signal<string | null>(null);
  readonly maxPrice = signal<string | null>(null);
  readonly minArea = signal<string | null>(null);
  readonly maxArea = signal<string | null>(null);
  readonly selectedBedrooms = signal<string | null>(null);
  readonly bedroomsOptions = signal<ZardComboboxOption[]>([]);
  
  // Filter panel states
  readonly isPricePanelOpen = signal(false);
  readonly isSurfacePanelOpen = signal(false);
  readonly isBedroomsPanelOpen = signal(false);
  
  // Price options (minimum 3000 DH)
  readonly priceOptions = signal<ZardComboboxOption[]>([
    { value: '', label: 'Indifférent' },
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
    
    // Apply pagination
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly filteredRequests = computed(() => {
    let filtered = this.requests();
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== null) {
      filtered = filtered.filter(req => req.category === category);
    }
    
    // Filter by price range (using budget for requests)
    const minPrice = this.minPrice();
    const maxPrice = this.maxPrice();
    if (minPrice && minPrice !== '') {
      const minPriceNum = parseFloat(minPrice);
      filtered = filtered.filter(req => req.budget >= minPriceNum);
    }
    if (maxPrice && maxPrice !== '') {
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(req => req.budget <= maxPriceNum);
    }
    
    // Filter by area range (using surface for requests)
    const minArea = this.minArea();
    const maxArea = this.maxArea();
    if (minArea && minArea !== '') {
      const minAreaNum = parseFloat(minArea);
      filtered = filtered.filter(req => req.surface >= minAreaNum);
    }
    if (maxArea && maxArea !== '') {
      const maxAreaNum = parseFloat(maxArea);
      filtered = filtered.filter(req => req.surface <= maxAreaNum);
    }
    
    // Filter by bedrooms (using pieces for requests)
    const bedrooms = this.selectedBedrooms();
    if (bedrooms && bedrooms !== '') {
      const bedroomsNum = parseInt(bedrooms, 10);
      filtered = filtered.filter(req => req.pieces >= bedroomsNum);
    }
    
    // Apply pagination
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly paginatedInfo = computed(() => {
    const viewType = this.selectedViewType();
    let total = 0;
    
    if (viewType === 'properties') {
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
      
      total = filtered.length;
    } else {
      let filtered = this.requests();
      
      const category = this.selectedCategory();
      if (category !== null) {
        filtered = filtered.filter(req => req.category === category);
      }
      
      const minPrice = this.minPrice();
      const maxPrice = this.maxPrice();
      if (minPrice && minPrice !== '') {
        const minPriceNum = parseFloat(minPrice);
        filtered = filtered.filter(req => req.budget >= minPriceNum);
      }
      if (maxPrice && maxPrice !== '') {
        const maxPriceNum = parseFloat(maxPrice);
        filtered = filtered.filter(req => req.budget <= maxPriceNum);
      }
      
      const minArea = this.minArea();
      const maxArea = this.maxArea();
      if (minArea && minArea !== '') {
        const minAreaNum = parseFloat(minArea);
        filtered = filtered.filter(req => req.surface >= minAreaNum);
      }
      if (maxArea && maxArea !== '') {
        const maxAreaNum = parseFloat(maxArea);
        filtered = filtered.filter(req => req.surface <= maxAreaNum);
      }
      
      const bedrooms = this.selectedBedrooms();
      if (bedrooms && bedrooms !== '') {
        const bedroomsNum = parseInt(bedrooms, 10);
        filtered = filtered.filter(req => req.pieces >= bedroomsNum);
      }
      
      total = filtered.length;
    }
    
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
    
    const viewType = this.selectedViewType();
    if (hasFilters) {
      return viewType === 'properties' 
        ? this.translateService.instant('collaboration.emptySearch')
        : this.translateService.instant('collaboration.emptyRequestsSearch');
    }
    return viewType === 'properties'
      ? this.translateService.instant('collaboration.empty')
      : this.translateService.instant('collaboration.emptyRequests');
  });

  readonly hasActiveFilters = computed(() => {
    return this.selectedCategory() !== null || 
           (this.minPrice() !== null && this.minPrice() !== '') || 
           (this.maxPrice() !== null && this.maxPrice() !== '') || 
           (this.minArea() !== null && this.minArea() !== '') || 
           (this.maxArea() !== null && this.maxArea() !== '') || 
           (this.selectedBedrooms() !== null && this.selectedBedrooms() !== '');
  });

  readonly hasData = computed(() => {
    const viewType = this.selectedViewType();
    return viewType === 'properties'
      ? this.filteredProperties().length > 0
      : this.filteredRequests().length > 0;
  });

  readonly isLoadingCurrentTab = computed(() => {
    return this.selectedViewType() === 'properties'
      ? this.isLoading()
      : this.isLoadingRequests();
  });

  ngOnInit(): void {
    this.loadCategoryOptions();
    this.loadBedroomsOptions();
    this.loadCollaborationProperties();
  }

  onPreviousImage(propertyId: string): void {
    const event = new Event('click');
    this.previousImage(propertyId, event);
  }

  onNextImage(propertyId: string): void {
    const event = new Event('click');
    this.nextImage(propertyId, event);
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

  loadCollaborationRequests(): void {
    this.isLoadingRequests.set(true);
    this.collaborationService.getCollaborationRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.requests.set(Array.isArray(requests) ? requests : []);
          this.isLoadingRequests.set(false);
          this.requestsLoadedOnce.set(true);
        },
        error: (error) => {
          console.error('Error loading collaboration requests:', error);
          this.requests.set([]);
          this.isLoadingRequests.set(false);
        }
      });
  }

  onViewTypeChange(viewType: CollaborationViewType): void {
    this.selectedViewType.set(viewType);
    this.currentPage.set(1);
    if (viewType === 'requests' && !this.requestsLoadedOnce()) {
      this.loadCollaborationRequests();
    }
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
    }
  }

  toggleSurfacePanel(): void {
    this.isSurfacePanelOpen.set(!this.isSurfacePanelOpen());
    // Close other panels
    if (this.isSurfacePanelOpen()) {
      this.isPricePanelOpen.set(false);
      this.isBedroomsPanelOpen.set(false);
    }
  }

  toggleBedroomsPanel(): void {
    this.isBedroomsPanelOpen.set(!this.isBedroomsPanelOpen());
    // Close other panels
    if (this.isBedroomsPanelOpen()) {
      this.isPricePanelOpen.set(false);
      this.isSurfacePanelOpen.set(false);
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

  onResetFilters(): void {
    this.selectedCategory.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minArea.set(null);
    this.maxArea.set(null);
    this.selectedBedrooms.set(null);
    this.isPricePanelOpen.set(false);
    this.isSurfacePanelOpen.set(false);
    this.isBedroomsPanelOpen.set(false);
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
    // Navigate to collaboration property detail page
    this.router.navigate(['/collaboration/detail', property.id]);
  }

  onViewPropertyFromCard(property: CollaborationProperty): void {
    this.onViewProperty(property);
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

  // Request contact methods
  callRequestCompany(request: CollaborationRequest): void {
    if (request.companyPhone) {
      window.location.href = `tel:${request.companyPhone}`;
    }
  }

  openMySharedPanel(): void {
    this.isMySharedPanelOpen.set(true);
    if (this.selectedViewType() === 'properties') {
      this.loadMySharedProperties();
    } else if (!this.requestsLoadedOnce()) {
      this.loadCollaborationRequests();
    }
  }

  closeMySharedPanel(): void {
    this.isMySharedPanelOpen.set(false);
  }

  loadMySharedProperties(): void {
    this.isLoadingMyShared.set(true);
    this.collaborationService.getMySharedProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.mySharedProperties.set(list);
          this.isLoadingMyShared.set(false);
        },
        error: (error) => {
          console.error('Error loading my shared properties:', error);
          this.mySharedProperties.set([]);
          this.isLoadingMyShared.set(false);
        }
      });
  }

  onDisablePropertyCollaboration(propertyId: string): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('collaboration.confirmDisable.title'),
      zDescription: this.translateService.instant('collaboration.confirmDisable.property'),
      zOkText: this.translateService.instant('collaboration.confirmDisable.ok'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.propertyService.updateCollaborationStatus(propertyId, false)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success(this.translateService.instant('collaboration.disabled'));
              this.loadCollaborationProperties();
              this.loadMySharedProperties();
            },
            error: (error) => {
              console.error('Error disabling collaboration for property:', error);
              this.toastService.error(this.translateService.instant('common.error'));
            }
          });
      }
    });
  }

  onDisableRequestCollaboration(requestId: string): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('collaboration.confirmDisable.title'),
      zDescription: this.translateService.instant('collaboration.confirmDisable.request'),
      zOkText: this.translateService.instant('collaboration.confirmDisable.ok'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
      if (confirmed) {
        this.propertyRequestService.updateCollaborationStatus(requestId, false)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastService.success(this.translateService.instant('collaboration.disabled'));
              this.loadCollaborationRequests();
            },
            error: (error) => {
              console.error('Error disabling collaboration for request:', error);
              this.toastService.error(this.translateService.instant('common.error'));
            }
          });
      }
    });
  }

  getPropertyDisplayLabel(property: Property): string {
    return property.name || property.identifier || this.translateService.instant('common.unnamedProperty');
  }

  getRequestLocationLabel(request: CollaborationRequest): string {
    if (request.ville && request.zone) return `${request.ville} - ${request.zone}`;
    return request.ville || request.zone || '';
  }

  getRequestCategoryLabel(request: CollaborationRequest): string {
    switch (request.category) {
      case PropertyCategory.Location:
        return this.translateService.instant('property.categories.location');
      case PropertyCategory.Vente:
        return this.translateService.instant('property.categories.vente');
      case PropertyCategory.LocationVacances:
        return this.translateService.instant('property.categories.locationVacances');
      default:
        return '';
    }
  }
}

