import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { AuthService } from '@shared/services/auth.service';

@Component({
    selector: 'app-accept-invitation',
    standalone: true,
    imports: [
        FormsModule,
        RouterLink,
        TranslateModule,
        ZardFormFieldComponent,
        ZardFormControlComponent,
        ZardFormLabelComponent,
        ZardInputDirective,
        ZardIconComponent,
        ZardInputGroupComponent
    ],
    templateUrl: './accept-invitation.component.html',
})
export class AcceptInvitationComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly authService = inject(AuthService);
    private readonly translateService = inject(TranslateService);

    token = signal('');

    form = {
        name: signal(''),
        phone: signal(''),
        password: signal(''),
        confirmPassword: signal(''),
    };

    showPassword = signal(false);
    showConfirmPassword = signal(false);
    isLoading = signal(false);
    errorMessage = signal('');
    formSubmitted = signal(false);

    readonly isFormValid = computed(() => {
        const password = this.form.password().trim();
        const confirmPassword = this.form.confirmPassword().trim();
        return password.length >= 8 && password === confirmPassword;
    });

    readonly passwordError = computed(() => {
        if (!this.formSubmitted()) return '';
        const password = this.form.password().trim();
        if (!password) return this.translateService.instant('login.passwordRequired');
        if (password.length < 8) return this.translateService.instant('acceptInvitation.passwordMinLength');
        return '';
    });

    readonly confirmPasswordError = computed(() => {
        if (!this.formSubmitted()) return '';
        const confirmPassword = this.form.confirmPassword().trim();
        if (!confirmPassword) return this.translateService.instant('acceptInvitation.confirmPasswordRequired');
        if (confirmPassword !== this.form.password().trim()) return this.translateService.instant('resetPassword.passwordsDoNotMatch');
        return '';
    });

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const tokenParam = params['token'];
            if (tokenParam) {
                this.token.set(tokenParam);
            } else {
                this.errorMessage.set(this.translateService.instant('acceptInvitation.invalidLink'));
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword.update((value) => !value);
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword.update((value) => !value);
    }

    onSubmit(event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        this.formSubmitted.set(true);
        this.errorMessage.set('');

        if (!this.token()) {
            this.errorMessage.set(this.translateService.instant('acceptInvitation.invalidToken'));
            return;
        }

        if (!this.isFormValid()) {
            return;
        }

        this.isLoading.set(true);

        const data = {
            token: this.token(),
            password: this.form.password().trim(),
            name: this.form.name().trim() || undefined,
            phone: this.form.phone().trim() || undefined,
        };
        
        this.authService.acceptInvitation(data).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/']);
            },
            error: (error) => {
                this.isLoading.set(false);

                const errorCode = error?.error?.code || error?.code;
                const errorMessage = error?.error?.message || error?.message;
                
                if (errorCode === 'token_expired') {
                    this.errorMessage.set(this.translateService.instant('acceptInvitation.tokenExpired'));
                } else if (errorCode === 'invalid_token') {
                    this.errorMessage.set(this.translateService.instant('acceptInvitation.invalidToken'));
                } else if (errorMessage) {
                    this.errorMessage.set(errorMessage);
                } else {
                    this.errorMessage.set(this.translateService.instant('acceptInvitation.failed'));
                }
            }
        });
    }
}
