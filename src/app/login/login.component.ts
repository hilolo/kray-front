import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ContentComponent } from '@shared/components/layout/content.component';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LayoutComponent,
    ContentComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  template: `
    <z-layout>
      <z-content>
        <div class="min-h-screen flex items-center justify-center bg-background p-4">
          <div class="w-full max-w-md space-y-8">
            <div class="text-center space-y-2">
              <h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p class="text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            <div class="rounded-lg border bg-card p-6 shadow-sm">
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                <z-form-field>
                  <z-form-label zRequired>Email</z-form-label>
                  <z-form-control [errorMessage]="emailError()">
                    <input
                      z-input
                      type="email"
                      [(ngModel)]="email"
                      name="email"
                      placeholder="name@example.com"
                      required
                      autocomplete="email"
                      class="w-full"
                    />
                  </z-form-control>
                </z-form-field>

                <z-form-field>
                  <z-form-label zRequired>Password</z-form-label>
                  <z-form-control [errorMessage]="passwordError()">
                    <div class="relative">
                      <input
                        z-input
                        [type]="showPassword() ? 'text' : 'password'"
                        [(ngModel)]="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        autocomplete="current-password"
                        class="w-full pr-10"
                      />
                      <button
                        type="button"
                        (click)="togglePasswordVisibility()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                      >
                        @if (showPassword()) {
                          <z-icon zType="eye-off" zSize="sm" />
                        } @else {
                          <z-icon zType="eye" zSize="sm" />
                        }
                      </button>
                    </div>
                  </z-form-control>
                </z-form-field>

                <div class="flex items-center justify-between">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="rememberMe"
                      name="rememberMe"
                      class="rounded border-gray-300"
                    />
                    <span class="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
                </div>

                @if (errorMessage()) {
                  <div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {{ errorMessage() }}
                  </div>
                }

                <z-button
                  type="submit"
                  zType="default"
                  zSize="default"
                  zFull
                  [zLoading]="isLoading()"
                  [attr.disabled]="isLoading() ? '' : null"
                >
                  @if (!isLoading()) {
                    Sign in
                  } @else {
                    Signing in...
                  }
                </z-button>
              </form>

              <div class="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?
                <a routerLink="/register" class="text-primary hover:underline font-medium"> Sign up </a>
              </div>
            </div>
          </div>
        </div>
      </z-content>
    </z-layout>
  `,
})
export class LoginComponent {
  private readonly router = inject(Router);

  email = '';
  password = '';
  rememberMe = false;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  emailError = signal('');
  passwordError = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
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

    if (passwordValue.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }

    // Simulate login
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      // In a real app, you would call an authentication service here
      // For now, we'll just navigate to home
      this.router.navigate(['/']);
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

