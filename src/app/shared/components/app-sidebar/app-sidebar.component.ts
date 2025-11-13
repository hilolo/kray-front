import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardDropdownModule } from '@shared/components/dropdown/dropdown.module';
import type { ZardIcon } from '@shared/components/icon/icons';
import { TranslateModule } from '@ngx-translate/core';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { ZardSheetRef } from '@shared/components/sheet/sheet-ref';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { UserService } from '@shared/services/user.service';
import { AuthService } from '@shared/services/auth.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';

@Component({
  selector: 'app-sidebar',
  exportAs: 'appSidebar',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardDropdownModule, RouterLink, RouterLinkActive, TranslateModule, ZardAvatarComponent, ZardDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-sidebar.component.html',
  host: {
    class: 'h-full',
  },
})
export class AppSidebarComponent implements OnDestroy {
  private readonly sheetService = inject(ZardSheetService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly destroy$ = new Subject<void>();
  private readonly storageKey = 'sidebarCollapsed';

  @ViewChild('mobileSidebarTemplate', { static: true }) mobileSidebarTemplate!: TemplateRef<any>;

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
    { route: '/contact', label: 'Contact', labelKey: 'menu.contact', icon: 'user' },
    { route: '/ai-chat', label: 'AI Chat', labelKey: 'menu.aiChat', icon: 'sparkles' },
    { route: '/file-manager', label: 'File Manager', labelKey: 'menu.fileManager', icon: 'folder' },
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

  readonly sidebarCollapsed = signal(this.loadCollapsedState());
  private mobileSidebarRef: ZardSheetRef | null = null;

  constructor() {
    // Persist sidebar collapsed state to localStorage whenever it changes
    effect(() => {
      const collapsed = this.sidebarCollapsed();
      localStorage.setItem(this.storageKey, String(collapsed));
    });
  }

  private loadCollapsedState(): boolean {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'true';
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
    this.router.navigate(['/settings']);
    this.closeMobileSidebar();
  }

  onLogoutClick(): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

