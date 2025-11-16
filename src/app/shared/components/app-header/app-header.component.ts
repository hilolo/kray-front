import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, OnInit, signal, ViewContainerRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardDropdownModule } from '@shared/components/dropdown/dropdown.module';
import { TranslateModule } from '@ngx-translate/core';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { AuthService } from '@shared/services/auth.service';
import { CommandPaletteService } from '@shared/services/command-palette.service';

@Component({
  selector: 'app-header',
  exportAs: 'appHeader',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardButtonComponent, ZardDropdownModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly commandPaletteService = inject(CommandPaletteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  readonly zOnMobileMenuClick = input<() => void>();
  readonly zOnSidebarToggle = input<(() => void) | null>(null);
  readonly zSidebarCollapsed = input<boolean>(false);
  readonly class = input<ClassValue>('');

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly isFullscreen = signal(false);

  ngOnInit(): void {
    // Initialize fullscreen state
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }

  onMobileMenuClick(): void {
    const handler = this.zOnMobileMenuClick();
    if (handler) {
      handler();
    }
  }

  onSidebarToggle(): void {
    const handler = this.zOnSidebarToggle();
    if (handler) {
      handler();
    }
  }

  showLogoutConfirmation(): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Log out',
      zDescription: 'Are you sure you want to log out?',
      zOkText: 'Log out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  /**
   * Open the command palette
   */
  openCommandPalette(): void {
    this.commandPaletteService.open();
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen.set(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        this.isFullscreen.set(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }

  /**
   * Listen for fullscreen changes (e.g., user presses ESC)
   */
  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  /**
   * Handle Cmd+K (or Ctrl+K) keyboard shortcut to open command palette
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openCommandPalette();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

