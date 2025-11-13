import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoService } from '@ngneat/transloco';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector       : 'settings-plan-billing',
    templateUrl    : './plan-billing.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, MatRadioModule, NgFor, NgClass, NgIf, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, CurrencyPipe, TranslocoModule],
})
export class SettingsPlanBillingComponent implements OnInit, OnDestroy
{
    planBillingForm: UntypedFormGroup;
    plans: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _translocoService: TranslocoService,
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
        // Create the form
        this.planBillingForm = this._formBuilder.group({
            plan: [{value: 'team', disabled: true}],
        });

        // Setup initial plans with translations
        this._setupPlans();

        // Listen for language changes
        this._translocoService.langChanges$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._setupPlans();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setup plans with translations
     */
    private _setupPlans(): void
    {
        // Wait for translations to be loaded
        this._translocoService.selectTranslateObject('plans')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(translations => {
                this.plans = [
                    {
                        value  : 'basic',
                        label  : translations.basic.label,
                        details: translations.basic.details,
                        description: translations.basic.description,
                        features: [
                            translations.basic.features.contacts,
                            translations.basic.features.properties,
                            translations.basic.features.email,
                            translations.basic.features.mobile,
                            translations.basic.features.support,
                            translations.basic.features.reporting
                        ],
                        price  : '10',
                    },
                    {
                        value  : 'team',
                        label  : translations.team.label,
                        details: translations.team.details,
                        description: translations.team.description,
                        features: [
                            translations.team.features.members,
                            translations.team.features.unlimited,
                            translations.team.features.collaboration,
                            translations.team.features.calendar,
                            translations.team.features.analytics,
                            translations.team.features.api,
                            translations.team.features.priority,
                            translations.team.features.templates
                        ],
                        price  : '20',
                    },
                    {
                        value  : 'enterprise',
                        label  : translations.enterprise.label,
                        details: translations.enterprise.details,
                        description: translations.enterprise.description,
                        features: [
                            translations.enterprise.features.unlimited_members,
                            translations.enterprise.features.unlimited_data,
                            translations.enterprise.features.white_label,
                            translations.enterprise.features.automation,
                            translations.enterprise.features.integrations,
                            translations.enterprise.features.security,
                            translations.enterprise.features.manager,
                            translations.enterprise.features.support_24_7,
                            translations.enterprise.features.custom_reports,
                            translations.enterprise.features.multi_location,
                            translations.enterprise.features.insights
                        ],
                        price  : '40',
                    },
                ];
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
}
