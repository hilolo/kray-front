import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppConfig {
    theme: 'light' | 'dark';
    contactViews?: {
        [key: string]: 'list' | 'cards';
    };
    leasingView?: 'grid' | 'list';
    reservationView?: 'list' | 'calendar';
    maintenanceView?: 'grid' | 'list';
}

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    private readonly CONFIG_KEY = 'app-config';
    private readonly DEFAULT_CONFIG: AppConfig = {
        theme: 'dark',
        contactViews: {}
    };

    private _config: BehaviorSubject<AppConfig>;

    constructor() {
        // Load config from localStorage or use default
        const savedConfig = this.loadConfigFromStorage();
        this._config = new BehaviorSubject<AppConfig>(savedConfig);
        
        // Migrate old config if exists
        this.migrateOldConfig();
    }

    /**
     * Get the current config observable
     */
    get config$(): Observable<AppConfig> {
        return this._config.asObservable();
    }

    /**
     * Get the current config value
     */
    get config(): AppConfig {
        return this._config.getValue();
    }

    /**
     * Update the entire config
     */
    set config(value: AppConfig) {
        this._config.next(value);
        this.saveConfigToStorage(value);
    }

    /**
     * Update theme only
     */
    setTheme(theme: 'light' | 'dark'): void {
        const currentConfig = this._config.getValue();
        const newConfig = { ...currentConfig, theme };
        this.config = newConfig;
    }


    /**
     * Get current theme
     */
    getTheme(): 'light' | 'dark' {
        return this._config.getValue().theme;
    }


    /**
     * Get the view preference for a specific contact type
     * @param contactType - The type of contact (tenant, owner, service)
     * @returns 'list' | 'cards'
     */
    getContactViewPreference(contactType: string): 'list' | 'cards' {
        const currentConfig = this._config.getValue();
        return currentConfig.contactViews?.[contactType] || 'list';
    }

    /**
     * Set the view preference for a specific contact type
     * @param contactType - The type of contact (tenant, owner, service)
     * @param view - The view type ('list' or 'cards')
     */
    setContactViewPreference(contactType: string, view: 'list' | 'cards'): void {
        const currentConfig = this._config.getValue();
        
        const newConfig = {
            ...currentConfig,
            contactViews: {
                ...currentConfig.contactViews,
                [contactType]: view
            }
        };
        
        this.config = newConfig;
    }

    /**
     * Get the leasing view preference
     * @returns 'grid' | 'list'
     */
    getLeasingViewPreference(): 'grid' | 'list' {
        const currentConfig = this._config.getValue();
        return currentConfig.leasingView || 'grid';
    }

    /**
     * Set the leasing view preference
     * @param view - The view type ('grid' or 'list')
     */
    setLeasingViewPreference(view: 'grid' | 'list'): void {
        const currentConfig = this._config.getValue();
        
        const newConfig = {
            ...currentConfig,
            leasingView: view
        };
        
        this.config = newConfig;
    }

    /**
     * Get the reservation view preference
     * @returns 'list' | 'calendar'
     */
    getReservationViewPreference(): 'list' | 'calendar' {
        const currentConfig = this._config.getValue();
        return currentConfig.reservationView || 'list';
    }

    /**
     * Set the reservation view preference
     * @param view - The view type ('list' or 'calendar')
     */
    setReservationViewPreference(view: 'list' | 'calendar'): void {
        const currentConfig = this._config.getValue();
        
        const newConfig = {
            ...currentConfig,
            reservationView: view
        };
        
        this.config = newConfig;
    }

    /**
     * Get the maintenance view preference
     * @returns 'grid' | 'list'
     */
    getMaintenanceViewPreference(): 'grid' | 'list' {
        const currentConfig = this._config.getValue();
        return currentConfig.maintenanceView || 'grid';
    }

    /**
     * Set the maintenance view preference
     * @param view - The view type ('grid' or 'list')
     */
    setMaintenanceViewPreference(view: 'grid' | 'list'): void {
        const currentConfig = this._config.getValue();
        
        const newConfig = {
            ...currentConfig,
            maintenanceView: view
        };
        
        this.config = newConfig;
    }

    /**
     * Reset config to default values
     */
    reset(): void {
        this.config = { ...this.DEFAULT_CONFIG };
    }

    /**
     * Load config from localStorage
     */
    private loadConfigFromStorage(): AppConfig {
        try {
            const savedConfig = localStorage.getItem(this.CONFIG_KEY);
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                // Validate the config structure
                if (this.isValidConfig(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to load config from localStorage:', error);
        }
        
        // Return default config if loading fails
        return { ...this.DEFAULT_CONFIG };
    }

    /**
     * Save config to localStorage
     */
    private saveConfigToStorage(config: AppConfig): void {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save config to localStorage:', error);
        }
    }

    /**
     * Validate config structure
     */
    private isValidConfig(config: any): config is AppConfig {
        return (
            config &&
            typeof config === 'object' &&
            (config.theme === 'light' || config.theme === 'dark') &&
            (config.contactViews === undefined || typeof config.contactViews === 'object')
        );
    }
    
    /**
     * Migrate old config from immogest_config to app-config
     */
    private migrateOldConfig(): void {
        try {
            const oldConfig = localStorage.getItem('immogest_config');
            if (oldConfig) {
                const parsed = JSON.parse(oldConfig);
                const currentConfig = this._config.getValue();
                
                // Merge contactViews from old config
                if (parsed.contactViews) {
                    const newConfig = {
                        ...currentConfig,
                        contactViews: parsed.contactViews
                    };
                    this.config = newConfig;
                }
                
                // Remove old config
                localStorage.removeItem('immogest_config');
            }
        } catch (error) {
            console.warn('Failed to migrate old config:', error);
        }
    }
}
