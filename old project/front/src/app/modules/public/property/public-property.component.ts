import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { PropertyService } from 'app/modules/admin/property/property.service';
import { AttachmentDetails, PublicProperty, getPropertyCategoryLabel } from 'app/modules/admin/property/property.types';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoService } from '@ngneat/transloco';
import { ImageViewerComponent } from 'app/core/image-viewer/image-viewer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PricePaymentTypePipe } from '@fuse/pipes/price-payment-type/price-payment-type.pipe';

@Component({
    selector: 'public-property',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        ImageViewerComponent,
        ReactiveFormsModule,
        PricePaymentTypePipe
    ],
    templateUrl: './public-property.component.html',
    styleUrls: ['./public-property.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicPropertyComponent implements OnInit, OnDestroy
{
    property: PublicProperty | null = null;
    isNotFound = false;
    activeImageIndex = 0;
    theme: 'light' | 'dark' = 'light';
    activeLang: 'en' | 'fr' = 'fr';
    readonly languageOptions: Array<{ id: 'en' | 'fr'; label: string }> = [
        { id: 'fr', label: 'FR' },
        { id: 'en', label: 'EN' }
    ];
    companyInfo: {
        name?: string;
        email?: string;
        phone?: string;
        website?: string;
        address?: string;
        logoUrl?: string;
    } | null = null;

    isImageViewerOpen = false;
    viewerIndex = 0;
    viewerImages: Array<{ url: string; name: string; size: number }> = [];
    contactForm: FormGroup | null = null;
    private _defaultMessage = '';
    private _referenceLabel = 'Propriété';

    private _destroy$ = new Subject<void>();
    private _currentPropertyId: string | null = null;
    private _originalBodySchemeClass: 'dark' | 'light' | null = null;

    constructor(
        private _route: ActivatedRoute,
        private _propertyService: PropertyService,
        private _errorHandler: ErrorHandlerService,
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        private _fb: FormBuilder
    )
    {
    }

    get isDarkMode(): boolean
    {
        return this.theme === 'dark';
    }

    ngOnInit(): void
    {
        if (this._document.body.classList.contains('dark'))
        {
            this._originalBodySchemeClass = 'dark';
            this.theme = 'dark';
        }
        else if (this._document.body.classList.contains('light'))
        {
            this._originalBodySchemeClass = 'light';
            this.theme = 'light';
        }
        else
        {
            this.theme = 'light';
        }

        this._applyBodyTheme();
        this._renderer2.addClass(this._document.body, 'hide-loading-bar');

        this._route.paramMap
            .pipe(takeUntil(this._destroy$))
            .subscribe(params => {
                const lang = params.get('lang');
                if (lang && this._isSupportedLang(lang))
                {
                    this._setLanguage(lang as 'en' | 'fr');
                }
                else if (!lang)
                {
                    const current = this._translocoService.getActiveLang();
                    this._setLanguage(this._isSupportedLang(current) ? current as 'en' | 'fr' : 'fr');
                }

                const id = params.get('id');
                if (!id)
                {
                    this._handleNotFound();
                    return;
                }

                this._currentPropertyId = id;
                this._fetchProperty(id);
            });
    }

    ngOnDestroy(): void
    {
        this._destroy$.next();
        this._destroy$.complete();

        this._renderer2.removeClass(this._document.body, 'hide-loading-bar');
        this._renderer2.removeClass(this._document.body, 'public-property-light');
        this._renderer2.removeClass(this._document.body, 'public-property-dark');

        if (this._originalBodySchemeClass)
        {
            this._renderer2.removeClass(this._document.body, 'dark');
            this._renderer2.removeClass(this._document.body, 'light');
            this._renderer2.addClass(this._document.body, this._originalBodySchemeClass);
        }
    }

    toggleTheme(): void
    {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this._applyBodyTheme();
        this._cdr.detectChanges();
    }

    switchLanguage(lang: 'en' | 'fr'): void
    {
        if (!this._isSupportedLang(lang))
        {
            return;
        }

        this._setLanguage(lang);
    }

    getLanguageLink(lang: 'en' | 'fr'): any[] | null
    {
        if (!this._currentPropertyId)
        {
            return null;
        }

        return this._getLanguageLinkSegments(lang);
    }

    private _fetchProperty(id: string): void
    {
        this.property = null;
        this.activeImageIndex = 0;
        this.isImageViewerOpen = false;
        this.viewerImages = [];
        this.viewerIndex = 0;
        this._cdr.markForCheck();

        this._propertyService
            .getPublicPropertyById(id)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (property) =>
                {
                    if (!property)
                    {
                        this._handleNotFound();
                        return;
                    }

                    this.property = property;
                    this.isNotFound = false;
                    this.companyInfo = {
                        name: property.companyName,
                        email: property.companyEmail,
                        phone: property.companyPhone,
                        website: property.companyWebsite,
                        address: property.companyAddress,
                        logoUrl: property.companyLogoUrl
                    };
                    this._initContactForm(property);
                    this._cdr.markForCheck();
                },
                error: () =>
                {
                    this._handleNotFound(true);
                }
            });
    }

    private _handleNotFound(showAlert: boolean = false): void
    {
        this.property = null;
        this.isNotFound = true;
        this.contactForm = null;
        this._cdr.markForCheck();

        if (showAlert)
        {
            this._errorHandler.showErrorAlert(
                'Property unavailable',
                'The requested property is not publicly accessible.'
            );
        }
    }

    get mainImageUrl(): string | null
    {
        if (!this.property)
        {
            return null;
        }

        if (this.property.defaultAttachmentUrl)
        {
            return this.property.defaultAttachmentUrl;
        }

        if (this.property.attachments?.length)
        {
            return this.property.attachments[0].url;
        }

        return null;
    }

    get galleryImages(): AttachmentDetails[]
    {
        return this.property?.attachments || [];
    }

    selectImage(index: number): void
    {
        if (!this.galleryImages.length)
        {
            return;
        }

        this.activeImageIndex = Math.min(Math.max(index, 0), this.galleryImages.length - 1);
        this._cdr.markForCheck();
    }

    nextImage(): void
    {
        if (!this.galleryImages.length)
        {
            return;
        }

        this.activeImageIndex = (this.activeImageIndex + 1) % this.galleryImages.length;
        this._cdr.markForCheck();
    }

    previousImage(): void
    {
        if (!this.galleryImages.length)
        {
            return;
        }

        this.activeImageIndex = this.activeImageIndex === 0
            ? this.galleryImages.length - 1
            : this.activeImageIndex - 1;
        this._cdr.markForCheck();
    }

    get activeImage(): AttachmentDetails | null
    {
        if (!this.property || !this.galleryImages.length)
        {
            return null;
        }

        return this.galleryImages[this.activeImageIndex] ?? this.galleryImages[0];
    }

    get hasMultipleImages(): boolean
    {
        return this.galleryImages.length > 1;
    }

    getCategoryLabel(category: string | number | undefined): string
    {
        if (category === undefined || category === null)
        {
            return 'Property';
        }

        if (typeof category === 'string')
        {
            const normalized = category.replace(/\s+/g, '').toLowerCase();
            switch (normalized)
            {
                case 'location':
                    return 'Location';
                case 'vente':
                    return 'Vente';
                case 'locationvacances':
                    return 'Location vacances';
                default:
                    return category;
            }
        }

        return getPropertyCategoryLabel(category);
    }

    formatNumber(value: number | undefined, suffix: string): string
    {
        if (value === undefined || value === null)
        {
            return '—';
        }

        return `${value} ${suffix}`;
    }

    formatPrice(price: number | undefined): string
    {
        if (price === undefined || price === null)
        {
            return '—';
        }

        return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price)} MAD`;
    }

    getWebsiteHref(): string | null
    {
        const website = this.companyInfo?.website?.trim();
        if (!website)
        {
            return null;
        }

        if (/^https?:\/\//i.test(website))
        {
            return website;
        }

        return `https://${website}`;
    }

    getPropertyAddress(): string
    {
        if (!this.property)
        {
            return '';
        }

        if (!this.property.address)
        {
            return this.property.city ? this.property.city : 'Address unavailable';
        }

        if (!this.property.isAddressPublic)
        {
            return this.property.city
                ? `${this.property.city} • Address hidden for privacy`
                : 'Address hidden for privacy';
        }

        if (this.property.city)
        {
            return `${this.property.address}, ${this.property.city}`;
        }

        return this.property.address;
    }

    navigateHome(): void
    {
        this._router.navigate(['/']);
    }

    private _setLanguage(lang: 'en' | 'fr'): void
    {
        this.activeLang = lang;
        if (this._translocoService.getActiveLang() !== lang)
        {
            this._translocoService.setActiveLang(lang);
        }
        document.documentElement.setAttribute('lang', lang);
    }

    private _isSupportedLang(value: string | null): value is 'en' | 'fr'
    {
        return value === 'en' || value === 'fr';
    }

    private _getLanguageLinkSegments(lang: 'en' | 'fr'): any[]
    {
        return ['/', lang, 'property', this._currentPropertyId, 'public'];
    }

    openImageViewer(index: number): void
    {
        // Prepare viewer images from gallery
        const images = this.galleryImages.map((attachment, i) => ({
            url: attachment.url,
            name: attachment.fileName || `Property image ${i + 1}`,
            size: 0
        }));

        // If no gallery images but we have a main image, use that
        if (images.length === 0 && this.mainImageUrl)
        {
            images.push({
                url: this.mainImageUrl,
                name: 'Property image',
                size: 0
            });
        }

        if (images.length === 0)
        {
            return;
        }

        this.viewerImages = images;
        this.viewerIndex = Math.min(Math.max(index, 0), this.viewerImages.length - 1);
        this.isImageViewerOpen = true;
        this._cdr.markForCheck();
    }

    closeImageViewer(): void
    {
        this.isImageViewerOpen = false;
        this._cdr.markForCheck();
    }

    onViewerImageChanged(index: number): void
    {
        this.viewerIndex = index;
        this._cdr.markForCheck();
    }

    private _applyBodyTheme(): void
    {
        this._renderer2.removeClass(this._document.body, 'public-property-light');
        this._renderer2.removeClass(this._document.body, 'public-property-dark');
        this._renderer2.removeClass(this._document.body, 'dark');
        this._renderer2.removeClass(this._document.body, 'light');

        const targetClass = this.theme === 'dark' ? 'public-property-dark' : 'public-property-light';
        this._renderer2.addClass(this._document.body, targetClass);

        this._renderer2.addClass(this._document.body, this.theme);
    }

    private _initContactForm(property: PublicProperty): void
    {
        this._referenceLabel = property.identifier || property.name || 'cette propriété';
        this._defaultMessage = `Bonjour, je suis intéressé par [${this._referenceLabel}]`;

        this.contactForm = this._fb.group({
            fullName: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            message: [this._defaultMessage, [Validators.required, Validators.minLength(10)]]
        });
    }

    submitContactForm(): void
    {
        if (!this.contactForm)
        {
            return;
        }

        if (this.contactForm.invalid)
        {
            this.contactForm.markAllAsTouched();
            this._errorHandler.showErrorAlert('Formulaire incomplet', 'Veuillez renseigner tous les champs requis.');
            this._cdr.markForCheck();
            return;
        }

        const formValue = this.contactForm.value;
        const companyEmail = this.companyInfo?.email;

        if (!companyEmail)
        {
            this._errorHandler.showErrorAlert('Contact indisponible', 'Aucune adresse email n’est associée à cette agence.');
            return;
        }

        const reference = this.property?.identifier || this.property?.name || 'cette propriété';
        const subject = encodeURIComponent(`Demande d'information - ${this._referenceLabel}`);
        const bodyLines = [
            `Nom: ${formValue.fullName}`,
            `Téléphone: ${formValue.phone}`,
            `Email: ${formValue.email}`,
            '',
            formValue.message
        ];

        const body = encodeURIComponent(bodyLines.join('\n'));
        const mailtoUrl = `mailto:${companyEmail}?subject=${subject}&body=${body}`;

        window.open(mailtoUrl, '_blank');
        this._errorHandler.showSuccessAlert('Message prêt', 'Un nouveau courriel a été ouvert dans votre client mail.');
    }

    get whatsappLink(): string | null
    {
        const phone = this.companyInfo?.phone?.replace(/\D+/g, '') ?? '';
        if (!phone)
        {
            return null;
        }

        const message = this.contactForm?.get('message')?.value || this._defaultMessage;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
}

