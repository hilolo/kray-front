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
import { UserService } from '@shared/services/user.service';

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
  private readonly userService = inject(UserService);

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
    this.isLoading.set(true);
    this.authService.login(emailValue, passwordValue).subscribe({
      next: (response) => {
        // After successful login, call sign-in-with-token to get full user data
        this.authService.signInWithToken().subscribe({
          next: (tokenResponse) => {
            // Fetch and store settings after successful login
            this.settingsService.getSettings().subscribe({
              next: (settings) => {
                // Store settings in localStorage
                localStorage.setItem('settings', JSON.stringify(settings));
                this.isLoading.set(false);
                // Check if company is restricted
                const company = this.userService.company();
                const isRestricted = company?.restricted === true;
                
                if (isRestricted) {
                  // Redirect to locked page if restricted
                  this.router.navigate(['/locked']);
                } else {
                  // Get return URL from route parameters or default to home
                  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  // Navigate to return URL or home on successful login
                  this.router.navigate([returnUrl]);
                }
              },
              error: (settingsError) => {
                console.error('Error fetching settings:', settingsError);
                // Continue even if settings fetch fails
                this.isLoading.set(false);
                // Check if company is restricted
                const company = this.userService.company();
                const isRestricted = company?.restricted === true;
                
                if (isRestricted) {
                  // Redirect to locked page if restricted
                  this.router.navigate(['/locked']);
                } else {
                  // Get return URL from route parameters or default to home
                  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                  this.router.navigate([returnUrl]);
                }
              },
            });
          },
          error: (tokenError) => {
            console.error('Sign in with token error:', tokenError);
            // Even if this fails, we still have the initial login data
            this.isLoading.set(false);
            // Check if company is restricted
            const company = this.userService.company();
            const isRestricted = company?.restricted === true;
            
            if (isRestricted) {
              // Redirect to locked page if restricted
              this.router.navigate(['/locked']);
            } else {
              // Get return URL from route parameters or default to home
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigate([returnUrl]);
            }
          },
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading.set(false);
        
        // Check if this is a company_restricted error
        // The error code can be in different places depending on how the error was thrown
        const errorCode = error?.code || error?.error?.code || error?.error?.error?.code;
        const errorMessage = error?.message || error?.error?.message || '';
        const isCompanyRestricted = errorCode === 'company_restricted' || 
                                   errorMessage.toLowerCase().includes('restricted');
        
        if (isCompanyRestricted) {
          // For restricted companies, allow login to proceed and redirect to locked page
          // Try to get user data from error response if available (backend might return it)
          const errorData = error?.data || error?.error?.data;
          if (errorData?.user) {
            // If user data is in the error response, store it
            this.authService.setUser(errorData.user);
            if (errorData.jwt?.token) {
              this.authService.setToken(errorData.jwt.token);
              this.authService.isAuthenticated.set(true);
            }
          }
          // Navigate to locked page
          this.router.navigate(['/locked']);
          return;
        }
        
        // Handle other error responses
        if (error.errors && error.errors.length > 0) {
          this.errorMessage.set(error.errors.join(', '));
        } else if (error.message) {
          this.errorMessage.set(error.message);
        } else if (error?.error?.message) {
          this.errorMessage.set(error.error.message);
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

