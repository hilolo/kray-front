import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CompanyRestrictionService } from 'app/core/company-restriction/company-restriction.service';
import { of, switchMap, tap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const companyRestrictionService = inject(CompanyRestrictionService);

    // Check the authentication status
    return inject(AuthService).check().pipe(
        switchMap((authenticated) =>
        {
            // If the user is not authenticated...
            if ( !authenticated )
            {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            }

            // Check if company is restricted
            companyRestrictionService.checkCompanyRestriction();

            // Allow the access
            return of(true);
        }),
    );
};
