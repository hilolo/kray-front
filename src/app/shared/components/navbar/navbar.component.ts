import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { ZardAlertDialogService } from '../alert-dialog/alert-dialog.service';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'z-navbar',
  exportAs: 'zNavbar',
  standalone: true,
  imports: [ZardButtonComponent, ZardIconComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex items-center justify-between h-full w-full">
      <!-- Logo Section - Left -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <ng-content select="[navbar-brand]"></ng-content>
      </div>
      
      <!-- Controls Section - Right -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Language Toggle -->
        <div class="flex items-center gap-1 border rounded-md">
          <z-button
            (click)="setLanguage('en')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'en'"
            class="rounded-r-none"
          >
            EN
          </z-button>
          <z-button
            (click)="setLanguage('fr')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'fr'"
            class="rounded-l-none border-l"
          >
            FR
          </z-button>
        </div>

        <!-- Dark Mode Toggle -->
        <z-button
          (click)="toggleTheme()"
          zType="ghost"
          zSize="icon"
          [attr.aria-label]="currentTheme() === 'dark' ? ('theme.switchToLight' | translate) : ('theme.switchToDark' | translate)"
        >
          @if (currentTheme() === 'dark') {
            <z-icon zType="sun" />
          } @else {
            <z-icon zType="moon" />
          }
        </z-button>

        <!-- Logout Button -->
        <z-button
          (click)="showLogoutConfirmation()"
          zType="ghost"
          zSize="icon"
          [attr.aria-label]="'Log out' | translate"
        >
          <z-icon zType="log-out" />
        </z-button>
      </div>
    </div>
  `,
})
export class ZardNavbarComponent implements OnDestroy {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly authService = inject(AuthService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }

  showLogoutConfirmation(): void {
    console.log('Navbar: showLogoutConfirmation called');
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Log out',
      zDescription: 'Are you sure you want to log out?',
      zOkText: 'Log out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    console.log('Navbar: Dialog created, waiting for user response...');
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      console.log('Navbar: Dialog closed with result:', result);
      if (result) {
        // User confirmed logout
        console.log('Navbar: User confirmed logout, calling authService.logout()');
        this.authService.logout();
      } else {
        console.log('Navbar: User cancelled logout');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

