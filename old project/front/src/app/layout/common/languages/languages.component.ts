import { NgFor, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfigService } from '@fuse/services/config';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';
import { LayoutComponent } from 'app/layout/layout.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector       : 'languages',
    templateUrl    : './languages.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'languages',
    standalone     : true,
    imports        : [MatButtonModule, MatMenuModule, NgTemplateOutlet, NgFor, MatIconModule, ThemeToggleComponent],
})
export class LanguagesComponent implements OnInit, OnDestroy
{
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any;
    currentScheme: 'light' | 'dark' = 'dark';

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _translocoService: TranslocoService,
        private _fuseConfigService: FuseConfigService,
        private _appConfigService: AppConfigService,
        private _navigationService: NavigationService,
        private _authService: AuthService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the available languages from transloco
        this.availableLangs = this._translocoService.getAvailableLangs();

        // Get current active language from application settings
        const settings = this._authService.getSettings();
        this.activeLang = settings?.language || 'en';
        
        // Ensure the current language is set correctly
        if (this.activeLang !== this._translocoService.getActiveLang()) {
            this._translocoService.setActiveLang(this.activeLang);
        }

        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe((activeLang) =>
        {
            // Get the active lang
            this.activeLang = activeLang;

            // Update language in application settings
            this._updateLanguageInSettings(activeLang);

            // Reload navigation with new language
            this._navigationService.get(activeLang).subscribe();

            // Update the navigation
            this._updateNavigation(activeLang);
            
            // Trigger change detection to update the UI
            this._changeDetectorRef.markForCheck();
        });

        // Set the country iso codes for languages for flags
        this.flagCodes = {
            'fr': 'fr',
            'en': 'us',
        };

        // Get current theme from config service
        this.currentScheme = this._appConfigService.getTheme();
        
        // Update the configuration service with the current theme
        this._fuseConfigService.config = {
            scheme: this.currentScheme
        };

        // Subscribe to config changes
        this._appConfigService.config$.subscribe(config => {
            this.currentScheme = config.theme;
            
            // Update the Fuse config service
            this._fuseConfigService.config = {
                scheme: this.currentScheme
            };
            
            // Trigger change detection
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
    }

    /**
     * Toggle between light and dark schemes
     */
    toggleScheme(): void 
    {
        const newScheme = this.currentScheme === 'dark' ? 'light' : 'dark';
        
        // Update the app config service
        this._appConfigService.setTheme(newScheme);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the active lang
     *
     * @param lang
     */
    setActiveLang(lang: string): void
    {
        // Set the active lang
        this._translocoService.setActiveLang(lang);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update language in application settings
     *
     * @param lang
     * @private
     */
    private _updateLanguageInSettings(lang: string): void
    {
        const currentSettings = this._authService.getSettings();
        if (currentSettings) {
            const updatedSettings = { ...currentSettings, language: lang };
            this._authService.updateSettings(updatedSettings);
        }
    }

    /**
     * Update the navigation
     *
     * @param lang
     * @private
     */
    private _updateNavigation(lang: string): void
    {
        // For the demonstration purposes, we will only update the Dashboard names
        // from the navigation but you can do a full swap and change the entire
        // navigation data.
        //
        // You can import the data from a file or request it from your backend,
        // it's up to you.

        // Get the component -> navigation data -> item
        const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

        // Return if the navigation component does not exist
        if ( !navComponent )
        {
            return null;
        }

        // Get the flat navigation data
        const navigation = navComponent.navigation;

        // Get the Project dashboard item and update its title
        const projectDashboardItem = this._fuseNavigationService.getItem('dashboards.project', navigation);
        if ( projectDashboardItem )
        {
            this._translocoService.selectTranslate('Project').pipe(take(1))
                .subscribe((translation) =>
                {
                    // Set the title
                    projectDashboardItem.title = translation;

                    // Refresh the navigation component
                    navComponent.refresh();
                });
        }

        // Get the Analytics dashboard item and update its title
        const analyticsDashboardItem = this._fuseNavigationService.getItem('dashboards.analytics', navigation);
        if ( analyticsDashboardItem )
        {
            this._translocoService.selectTranslate('Analytics').pipe(take(1))
                .subscribe((translation) =>
                {
                    // Set the title
                    analyticsDashboardItem.title = translation;

                    // Refresh the navigation component
                    navComponent.refresh();
                });
        }
    }
}
