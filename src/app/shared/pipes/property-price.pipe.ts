import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TypePaiment } from '../models/property/property.model';

@Pipe({
  name: 'propertyPrice',
  standalone: true,
})
export class PropertyPricePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  transform(price: number | null | undefined, typePaiment: TypePaiment | string | null | undefined): string {
    if (!price || price === 0) {
      return '-';
    }

    const formattedPrice = price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const currency = this.translateService.instant('property.price.currency') || 'MAD';

    if (typePaiment === null || typePaiment === undefined) {
      return `${formattedPrice} ${currency}`;
    }

    // Handle both enum values and string values from backend
    const paymentType = this.normalizePaymentType(typePaiment);

    switch (paymentType) {
      case TypePaiment.Monthly:
        return `${formattedPrice} ${currency}/${this.translateService.instant('property.price.month')}`;
      case TypePaiment.Weekly:
        return `${formattedPrice} ${currency}/${this.translateService.instant('property.price.week')}`;
      case TypePaiment.Daily:
        return `${formattedPrice} ${currency}/${this.translateService.instant('property.price.day')}`;
      case TypePaiment.Fixed:
        return `${formattedPrice} ${currency}`;
      default:
        return `${formattedPrice} ${currency}`;
    }
  }

  /**
   * Normalize payment type from string or enum to enum value
   */
  private normalizePaymentType(typePaiment: TypePaiment | string): TypePaiment {
    // If it's already an enum value (number), return it
    if (typeof typePaiment === 'number') {
      return typePaiment as TypePaiment;
    }

    // If it's a string, convert to enum
    if (typeof typePaiment === 'string') {
      const normalized = typePaiment.toLowerCase().trim();
      switch (normalized) {
        case 'monthly':
          return TypePaiment.Monthly;
        case 'weekly':
          return TypePaiment.Weekly;
        case 'daily':
          return TypePaiment.Daily;
        case 'fixed':
          return TypePaiment.Fixed;
        default:
          // Try to parse as number if it's a string number
          const numValue = parseInt(normalized, 10);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 3) {
            return numValue as TypePaiment;
          }
          return TypePaiment.Fixed; // Default fallback
      }
    }

    return TypePaiment.Fixed; // Default fallback
  }
}

