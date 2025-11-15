import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { AuthService } from '@shared/services/auth.service';
import { SettingsService } from '@shared/services/settings.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly darkmodeService = inject(DarkModeService);
  private readonly authService = inject(AuthService);
  private readonly settingsService = inject(SettingsService);

  email = 'admin@admin.com';
  password = 'admin';
  rememberMe = false;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  emailError = signal('');
  passwordError = signal('');
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly logoError = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(event?: Event): void {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }

    // Reset errors
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');

    // Basic validation
    const emailValue = this.email;
    const passwordValue = this.password;

    if (!emailValue) {
      this.emailError.set('Email is required');
      return;
    }

    if (!this.isValidEmail(emailValue)) {
      this.emailError.set('Please enter a valid email address');
      return;
    }

    if (!passwordValue) {
      this.passwordError.set('Password is required');
      return;
    }

    // Prevent multiple submissions
    if (this.isLoading()) {
      return;
    }

    // Call authentication service
    console.log('Calling auth service with:', { email: emailValue, password: '***' });
    this.isLoading.set(true);
    this.authService.login(emailValue, passwordValue).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // After successful login, call sign-in-with-token to get full user data
        this.authService.signInWithToken().subscribe({
          next: (tokenResponse) => {
            console.log('Sign in with token successful:', tokenResponse);
            // Fetch and store settings after successful login
            this.settingsService.getSettings().subscribe({
              next: (settings) => {
                console.log('Settings fetched successfully:', settings);
                // Store settings in localStorage
                localStorage.setItem('settings', JSON.stringify(settings));
                this.isLoading.set(false);
                // Get return URL from route parameters or default to home
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                console.log('[LoginComponent] ✅ All login steps completed, navigating to:', returnUrl);
                // Navigate to return URL or home on successful login
                this.router.navigate([returnUrl]);
              },
              error: (settingsError) => {
                console.error('Error fetching settings:', settingsError);
                // Continue even if settings fetch fails
                this.isLoading.set(false);
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                console.log('[LoginComponent] ⚠️ Settings fetch failed, but navigating to:', returnUrl);
                this.router.navigate([returnUrl]);
              },
            });
          },
          error: (tokenError) => {
            console.error('Sign in with token error:', tokenError);
            // Even if this fails, we still have the initial login data
            this.isLoading.set(false);
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            console.log('[LoginComponent] ⚠️ Sign in with token failed, but navigating to:', returnUrl);
            this.router.navigate([returnUrl]);
          },
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading.set(false);
        // Handle error response
        if (error.errors && error.errors.length > 0) {
          this.errorMessage.set(error.errors.join(', '));
        } else if (error.message) {
          this.errorMessage.set(error.message);
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

