import { ChangeDetectionStrategy, Component, computed, inject, input, signal, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardDropdownModule } from '@shared/components/dropdown/dropdown.module';
import type { ZardIcon } from '@shared/components/icon/icons';
import { TranslateModule } from '@ngx-translate/core';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { ZardSheetRef } from '@shared/components/sheet/sheet-ref';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { AuthService } from '@shared/services/auth.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'z-page',
  exportAs: 'zPage',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardButtonComponent, ZardDropdownModule, RouterLink, RouterLinkActive, TranslateModule, ZardAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './page.component.html',
})
export class ZardPageComponent implements OnDestroy {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly sheetService = inject(ZardSheetService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mobileSidebarTemplate', { static: true }) mobileSidebarTemplate!: TemplateRef<any>;

  readonly zTitle = input<string>('Dashboard');
  readonly zSidebarWidth = input<number>(240);
  readonly zSidebarItems = input<
    Array<{
      route: string;
      label: string;
      labelKey?: string;
      icon?: ZardIcon;
    }>
  >([
    { route: '/', label: 'Bureau', labelKey: 'menu.bureau', icon: 'monitor' },
    { route: '/biens', label: 'Biens', labelKey: 'menu.biens', icon: 'house' },
    { route: '/lots', label: 'Lots', labelKey: 'menu.lots', icon: 'layers' },
    { route: '/immeubles', label: 'Immeubles', labelKey: 'menu.immeubles', icon: 'building' },
    { route: '/locataires', label: 'Locataires', labelKey: 'menu.locataires', icon: 'users' },
    { route: '/locations', label: 'Locations', labelKey: 'menu.locations', icon: 'lock' },
    { route: '/reservations', label: 'Réservations', labelKey: 'menu.reservations', icon: 'calendar' },
    { route: '/inventaires', label: 'Inventaires', labelKey: 'menu.inventaires', icon: 'folder' },
    { route: '/etat-des-lieux', label: 'Etat des lieux', labelKey: 'menu.etatDesLieux', icon: 'clipboard' },
    { route: '/settings', label: 'Settings', labelKey: 'menu.settings', icon: 'settings' },
  ]);
  readonly zUserName = input<string>('');
  readonly zUserEmail = input<string>('');
  readonly zUserAvatar = input<string | null>(null);
  readonly class = input<ClassValue>('');

  // User information from service
  readonly userName = computed(() => {
    const inputName = this.zUserName();
    if (inputName) return inputName;
    return this.userService.userName();
  });

  readonly userEmail = computed(() => {
    const inputEmail = this.zUserEmail();
    if (inputEmail) return inputEmail;
    return this.userService.userEmail();
  });

  readonly userAvatar = computed(() => {
    const inputAvatar = this.zUserAvatar();
    if (inputAvatar) return inputAvatar;
    return this.userService.userAvatar();
  });

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly logoError = signal(false);
  readonly sidebarCollapsed = signal(false);
  private mobileSidebarRef: ZardSheetRef | null = null;

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  openMobileSidebar(): void {
    if (this.mobileSidebarRef) {
      return;
    }

    this.mobileSidebarRef = this.sheetService.create({
      zContent: this.mobileSidebarTemplate,
      zSide: 'left',
      zSize: 'default',
      zTitle: '',
      zClosable: true,
      zMaskClosable: true,
      zViewContainerRef: this.viewContainerRef,
      zWidth: `${this.zSidebarWidth()}px`,
      zOnCancel: () => {
        this.mobileSidebarRef = null;
      },
    });
  }

  closeMobileSidebar(): void {
    if (this.mobileSidebarRef) {
      this.mobileSidebarRef.close();
      this.mobileSidebarRef = null;
    }
  }

  getRouterLinkActiveOptions(route: string): { exact: boolean } {
    return route === '/' ? { exact: true } : { exact: false };
  }

  onSettingsClick(): void {
    // Navigate to settings page
    this.router.navigate(['/settings']);
  }

  onLogoutClick(): void {
    // Handle logout click from sidebar dropdown
    console.log('onLogoutClick called');
    this.showLogoutConfirmation();
  }

  showLogoutConfirmation(): void {
    console.log('showLogoutConfirmation called');
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Log out',
      zDescription: 'Are you sure you want to log out?',
      zOkText: 'Log out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    console.log('Dialog created, waiting for user response...');
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      console.log('Dialog closed with result:', result);
      if (result) {
        // User confirmed logout
        console.log('User confirmed logout, calling authService.logout()');
        this.authService.logout();
      } else {
        console.log('User cancelled logout');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

