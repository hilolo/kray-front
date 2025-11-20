import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, filter } from 'rxjs';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, NavigationStart } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardDropdownModule } from '@shared/components/dropdown/dropdown.module';
import type { ZardIcon } from '@shared/components/icon/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ZardSheetService } from '@shared/components/sheet/sheet.service';
import { ZardSheetRef } from '@shared/components/sheet/sheet-ref';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { UserService } from '@shared/services/user.service';
import { AuthService } from '@shared/services/auth.service';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { DarkModeService } from '@shared/services/darkmode.service';
import { ZardTooltipDirective } from '@shared/components/tooltip/tooltip';

@Component({
  selector: 'app-sidebar',
  exportAs: 'appSidebar',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardDropdownModule, RouterLink, RouterLinkActive, TranslateModule, ZardAvatarComponent, ZardDividerComponent, ZardTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-sidebar.component.html',
  host: {
    class: 'h-full',
  },
})
export class AppSidebarComponent implements OnInit, OnDestroy {
  private readonly sheetService = inject(ZardSheetService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly translateService = inject(TranslateService);
  private readonly darkmodeService = inject(DarkModeService);
  private readonly destroy$ = new Subject<void>();
  private readonly storageKey = 'sidebarCollapsed';

  @ViewChild('mobileSidebarTemplate', { static: true }) mobileSidebarTemplate!: TemplateRef<any>;

  readonly zSidebarWidth = input<number>(240);
  readonly zSidebarItems = input<
    Array<{
      group?: string;
      groupKey?: string;
      items: Array<{
        route: string;
        label: string;
        labelKey?: string;
        icon?: ZardIcon;
      }>;
    }>
  >([
    {
      group: 'L\'essentiel',
      groupKey: 'sidebar.essential',
      items: [
        { route: '/', label: 'Dashboard', labelKey: 'menu.dashboard', icon: 'monitor' },
        { route: '/contact/tenants', label: 'Tenants', labelKey: 'menu.tenants', icon: 'user' },
        { route: '/contact/owners', label: 'Owners', labelKey: 'menu.owners', icon: 'users' },
        { route: '/contact/services', label: 'Services', labelKey: 'menu.services', icon: 'building' },
        { route: '/property', label: 'Properties', labelKey: 'menu.properties', icon: 'house' },
        { route: '/building', label: 'Buildings', labelKey: 'menu.buildings', icon: 'building' },
        { route: '/leasing', label: 'Leasing', labelKey: 'menu.leasing', icon: 'file-text' },
        { route: '/reservation', label: 'Reservations', labelKey: 'menu.reservations', icon: 'calendar' },
        { route: '/transaction', label: 'Transactions', labelKey: 'menu.transactions', icon: 'banknote' },
        { route: '/settings', label: 'Settings', labelKey: 'menu.settings', icon: 'settings' },
      ],
    },
    {
      group: 'Le plus',
      groupKey: 'sidebar.more',
      items: [
        { route: '/keys', label: 'Keys', labelKey: 'menu.keys', icon: 'lock' },
        { route: '/bank', label: 'Banks', labelKey: 'menu.banks', icon: 'building-2' },
        { route: '/tasks', label: 'Tasks', labelKey: 'menu.tasks', icon: 'clipboard' },
        { route: '/maintenance', label: 'Maintenance', labelKey: 'menu.maintenance', icon: 'settings' },
        { route: '/ai-chat', label: 'AI Chat', labelKey: 'menu.aiChat', icon: 'sparkles' },
        { route: '/file-manager', label: 'File Manager', labelKey: 'menu.fileManager', icon: 'folder' },
        { route: '/document', label: 'Documents', labelKey: 'menu.documents', icon: 'file' },
      ],
    },
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
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly logoError = signal(false);
  private mobileSidebarRef: ZardSheetRef | null = null;

  constructor() {
    // Persist sidebar collapsed state to localStorage whenever it changes
    effect(() => {
      const collapsed = this.sidebarCollapsed();
      localStorage.setItem(this.storageKey, String(collapsed));
    });

    // Hide all tooltips when navigation starts (immediate hide on click)
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Hide immediately when navigation starts
        this.hideAllTooltips();
      });

    // Also hide on navigation end as backup
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Hide immediately on navigation end
        this.hideAllTooltips();
        // Also hide after a short delay to catch any lingering tooltips
        setTimeout(() => this.hideAllTooltips(), 50);
      });
  }

  ngOnInit(): void {
    // Tooltips will be hidden via click handlers and router navigation
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

  getItemLabel(item: { label: string; labelKey?: string }): string {
    if (item.labelKey) {
      return this.translateService.instant(item.labelKey);
    }
    return item.label;
  }

  hideAllTooltips(): void {
    if (typeof document === 'undefined') return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Method 1: Find and directly remove tooltip overlay elements
      // Tooltips are rendered in CDK overlay containers with data-side attribute
      const tooltipOverlays = document.querySelectorAll('[data-side]');
      tooltipOverlays.forEach(overlay => {
        const state = overlay.getAttribute('data-state');
        if (state === 'opened') {
          // Set state to closed immediately
          overlay.setAttribute('data-state', 'closed');
          // Remove the overlay element directly
          overlay.remove();
        }
      });

      // Method 2: Find CDK overlay containers and remove tooltip content
      const cdkOverlayContainers = document.querySelectorAll('.cdk-overlay-container');
      cdkOverlayContainers.forEach(container => {
        const tooltipElements = container.querySelectorAll('[data-side]');
        tooltipElements.forEach(element => {
          element.remove();
        });
      });

      // Method 3: Dispatch mouseleave events on all tooltip triggers as backup
      const tooltipTriggers = document.querySelectorAll('[zTooltip]');
      tooltipTriggers.forEach(element => {
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(mouseLeaveEvent);
      });
    });
  }

  onMenuItemClick(event: Event): void {
    // Hide tooltip immediately when clicking
    const target = event.currentTarget as HTMLElement;
    if (target) {
      // Dispatch mouseleave event
      const mouseLeaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(mouseLeaveEvent);
    }
    
    // Also hide all tooltips immediately (no delay)
    this.hideAllTooltips();
    this.closeMobileSidebar();
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

