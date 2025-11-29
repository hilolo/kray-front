import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
            (click)="setLanguage('fr')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'fr'"
            class="rounded-r-none"
          >
            FR
          </z-button>
          <z-button
            (click)="setLanguage('en')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'en'"
            class="rounded-l-none border-l"
          >
            EN
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
          [attr.aria-label]="'login.logOut' | translate"
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
  private readonly translateService = inject(TranslateService);
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
    const dialogRef = this.alertDialogService.confirm({
      zTitle: this.translateService.instant('login.logoutConfirm.title'),
      zDescription: this.translateService.instant('login.logoutConfirm.description'),
      zOkText: this.translateService.instant('login.logoutConfirm.ok'),
      zCancelText: this.translateService.instant('common.cancel'),
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        // User confirmed logout
        this.authService.logout();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

