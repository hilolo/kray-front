import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type { CollaborationRequest } from '@shared/models/collaboration/collaboration-request.model';
import { PropertyCategory } from '@shared/models/property/property.model';
import { inject } from '@angular/core';

@Component({
  selector: 'app-collaboration-request-card',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collaboration-request-card.component.html',
})
export class CollaborationRequestCardComponent {
  private readonly translateService = inject(TranslateService);

  // Inputs
  readonly request = input.required<CollaborationRequest>();

  // Outputs
  readonly contactCall = output<CollaborationRequest>();
  readonly contactWhatsApp = output<CollaborationRequest>();

  // Computed
  readonly categoryLabel = computed(() => {
    const category = this.request().category;
    switch (category) {
      case PropertyCategory.Location:
        return this.translateService.instant('property.categories.location');
      case PropertyCategory.Vente:
        return this.translateService.instant('property.categories.vente');
      case PropertyCategory.LocationVacances:
        return this.translateService.instant('property.categories.locationVacances');
      default:
        return '';
    }
  });

  readonly categoryColor = computed(() => {
    const category = this.request().category;
    switch (category) {
      case PropertyCategory.Location:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case PropertyCategory.Vente:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case PropertyCategory.LocationVacances:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  });

  onContactCall(event: Event): void {
    event.stopPropagation();
    this.contactCall.emit(this.request());
  }

  onContactWhatsApp(event: Event): void {
    event.stopPropagation();
    this.contactWhatsApp.emit(this.request());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(price) + ' DH';
  }
}
