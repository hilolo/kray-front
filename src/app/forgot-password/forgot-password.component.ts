import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { PasswordResetService } from '@shared/services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  readonly router = inject(Router);
  private readonly passwordResetService = inject(PasswordResetService);

  email = signal('');
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  emailError = signal('');

  onSubmit(event?: Event): void {
    console.log('onSubmit called', event);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Reset errors
    this.errorMessage.set('');
    this.emailError.set('');

    const emailValue = this.email().trim();
    console.log('Email value:', emailValue);

    // Validation
    if (!emailValue) {
      this.emailError.set('Email is required');
      console.log('Validation failed: Email is required');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.emailError.set('Please enter a valid email address');
      console.log('Validation failed: Invalid email format');
      return;
    }

    // Prevent multiple submissions
    if (this.isLoading()) {
      console.log('Already loading, skipping submission');
      return;
    }

    console.log('Calling password reset service...');
    // Call password reset service
    this.isLoading.set(true);
    this.passwordResetService.forgotPassword(emailValue).subscribe({
      next: (response) => {
        console.log('Password reset request successful:', response);
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        console.error('Error details:', {
          message: error?.message,
          error: error?.error,
          status: error?.status,
          statusText: error?.statusText,
        });
        this.isLoading.set(false);
        
        // Always show success message for security (don't reveal if email exists)
        this.isSuccess.set(true);
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

