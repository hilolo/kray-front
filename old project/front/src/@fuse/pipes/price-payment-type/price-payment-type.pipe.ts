import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Formats price with payment type suffix
 * 
 * Usage: {{ price | pricePaymentType: typePaiment }}
 * 
 * Examples:
 * - Monthly: "1000 MAD / month" (EN) or "1000 MAD / mois" (FR)
 * - Weekly: "250 MAD / Weekly" (EN) or "250 MAD / Semaine" (FR)
 * - Daily: "50 MAD / day" (EN) or "50 MAD / Jour" (FR)
 * - Fixed: "50000 MAD" (both languages)
 */
@Pipe({
    name      : 'pricePaymentType',
    pure      : false,
    standalone: true,
})
export class PricePaymentTypePipe implements PipeTransform
{
    /**
     * Constructor
     */
    constructor(
        private _translocoService: TranslocoService,
    )
    {
    }

    /**
     * Transform
     *
     * @param price The price value
     * @param typePaiment The payment type (0=Monthly, 1=Daily, 2=Weekly, 3=Fixed)
     */
    transform(price: number | null | undefined, typePaiment: number | string | null | undefined): string
    {
        // If no price, return empty string
        if (price === null || price === undefined) {
            return '';
        }

        // Format price as number
        const formattedPrice = price.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        // If no payment type, return just the price with MAD
        if (typePaiment === null || typePaiment === undefined) {
            return `${formattedPrice} MAD`;
        }

        // Get current language
        const currentLang = this._translocoService.getActiveLang() || 'en';

        // Determine payment type
        let paymentType: string;
        
        if (typeof typePaiment === 'string') {
            paymentType = typePaiment.toLowerCase();
        } else {
            // Handle numeric enum values
            switch (typePaiment) {
                case 0: // Monthly
                    paymentType = 'monthly';
                    break;
                case 1: // Daily
                    paymentType = 'daily';
                    break;
                case 2: // Weekly
                    paymentType = 'weekly';
                    break;
                case 3: // Fixed
                    paymentType = 'fixed';
                    break;
                default:
                    return formattedPrice;
            }
        }

        // Get translation key based on payment type
        let translationKey: string;
        
        switch (paymentType) {
            case 'monthly':
                translationKey = 'price_payment_type.monthly';
                break;
            case 'weekly':
                translationKey = 'price_payment_type.weekly';
                break;
            case 'daily':
                translationKey = 'price_payment_type.daily';
                break;
            case 'fixed':
                // For fixed, return the price with MAD but without suffix
                return `${formattedPrice} MAD`;
            default:
                return `${formattedPrice} MAD`;
        }

        // Get translated suffix
        const suffix = this._translocoService.translate(translationKey);

        // Return formatted price with MAD and suffix
        return `${formattedPrice} MAD / ${suffix}`;
    }
}

