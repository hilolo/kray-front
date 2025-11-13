import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { AuthService } from 'app/core/auth/auth.service';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';

export const initialDataResolver = () =>
{
    const navigationService = inject(NavigationService);
    const authService = inject(AuthService);
    const translocoService = inject(TranslocoService);

    // Get current language from application settings
    const settings = authService.getSettings();
    const currentLanguage = settings?.language || 'en';

    return forkJoin([
        navigationService.get(currentLanguage),
    ]);
};
