import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { PropertyPricePipe } from '@shared/pipes/property-price.pipe';
import { TranslateModule } from '@ngx-translate/core';
import type { CollaborationProperty } from '@shared/models/collaboration/collaboration-property.model';

@Component({
  selector: 'app-collaboration-property-card',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
    PropertyPricePipe,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collaboration-property-card.component.html',
})
export class CollaborationPropertyCardComponent {
  private readonly router = inject(Router);

  // Inputs
  readonly property = input.required<CollaborationProperty>();
  readonly currentImageIndex = input<number>(0);
  readonly images = input<string[]>([]);

  // Outputs
  readonly previousImage = output<string>();
  readonly nextImage = output<string>();
  readonly viewProperty = output<CollaborationProperty>();
  readonly contactCall = output<CollaborationProperty>();
  readonly contactWhatsApp = output<CollaborationProperty>();

  // Computed
  readonly currentImage = computed(() => {
    const imgs = this.images();
    const index = this.currentImageIndex();
    return imgs[index] || this.property().defaultAttachmentUrl || null;
  });

  readonly hasMultipleImages = computed(() => {
    return this.images().length > 1;
  });

  readonly propertyDisplayName = computed(() => {
    const prop = this.property();
    return prop.name || prop.identifier || '';
  });

  readonly propertyInitials = computed(() => {
    const name = this.propertyDisplayName();
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  readonly companyInitials = computed(() => {
    const name = this.property().companyName?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  onPreviousImage(event: Event): void {
    event.stopPropagation();
    this.previousImage.emit(this.property().id);
  }

  onNextImage(event: Event): void {
    event.stopPropagation();
    this.nextImage.emit(this.property().id);
  }

  onViewProperty(event: Event): void {
    event.stopPropagation();
    this.viewProperty.emit(this.property());
  }

  onContactCall(event: Event): void {
    event.stopPropagation();
    this.contactCall.emit(this.property());
  }

  onContactWhatsApp(event: Event): void {
    event.stopPropagation();
    this.contactWhatsApp.emit(this.property());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

