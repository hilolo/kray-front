import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { PasswordResetService } from '@shared/services/password-reset.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslateModule,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly passwordResetService = inject(PasswordResetService);
  private readonly translateService = inject(TranslateService);

  token = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  newPasswordError = signal('');
  confirmPasswordError = signal('');

  formSubmitted = signal(false);

  readonly isFormValid = computed(() => {
    const newPass = this.newPassword().trim();
    const confirmPass = this.confirmPassword().trim();
    return newPass.length >= 5 && newPass === confirmPass;
  });

  readonly newPasswordHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    const newPass = this.newPassword().trim();
    return !newPass || newPass.length < 5;
  });

  readonly confirmPasswordHasError = computed(() => {
    if (!this.formSubmitted()) return false;
    const newPass = this.newPassword().trim();
    const confirmPass = this.confirmPassword().trim();
    return !confirmPass || confirmPass !== newPass;
  });

  readonly newPasswordErrorMessage = computed(() => {
    if (!this.formSubmitted()) return '';
    const newPass = this.newPassword().trim();
    if (!newPass) {
      return this.translateService.instant('login.passwordRequired');
    }
    if (newPass.length < 5) {
      return this.translateService.instant('resetPassword.passwordMinLength');
    }
    return '';
  });

  readonly confirmPasswordErrorMessage = computed(() => {
    if (!this.formSubmitted()) return '';
    const confirmPass = this.confirmPassword().trim();
    if (!confirmPass) {
      return this.translateService.instant('resetPassword.confirmPasswordRequired');
    }
    if (confirmPass !== this.newPassword().trim()) {
      return this.translateService.instant('resetPassword.passwordsDoNotMatch');
    }
    return '';
  });

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe((params) => {
      const tokenParam = params['token'];
      if (tokenParam) {
        this.token.set(tokenParam);
      } else {
        // No token provided, redirect to forgot password
        this.router.navigate(['/forgot-password']);
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
    }

    // Mark form as submitted
    this.formSubmitted.set(true);

    // Reset errors
    this.errorMessage.set('');

    // Guard: prevent execution if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Prevent multiple submissions
    if (this.isLoading()) {
      return;
    }

    const tokenValue = this.token();
    if (!tokenValue) {
      this.errorMessage.set(this.translateService.instant('resetPassword.invalidToken'));
      return;
    }

    // Call password reset service
    this.isLoading.set(true);
    this.passwordResetService
      .resetPassword(
        tokenValue,
        this.newPassword().trim(),
        this.confirmPassword().trim()
      )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          // Reset form submitted state on success
          this.formSubmitted.set(false);
        },
        error: (error) => {
          console.error('Reset password error:', error);
          this.isLoading.set(false);
          
          const errorCode = error?.code || error?.error?.code;
          const errorMsg = error?.message || error?.error?.message || this.translateService.instant('resetPassword.resetFailed');
          
          if (errorCode === 'invalid_token' || errorMsg.toLowerCase().includes('token')) {
            this.errorMessage.set(this.translateService.instant('resetPassword.invalidOrExpiredToken'));
          } else {
            this.errorMessage.set(errorMsg);
          }
        },
      });
  }
}

