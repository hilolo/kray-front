import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, input, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { AppSidebarComponent } from '@shared/components/app-sidebar/app-sidebar.component';
import type { ZardIcon } from '@shared/components/icon/icons';

@Component({
  selector: 'z-page',
  exportAs: 'zPage',
  standalone: true,
  imports: [LayoutModule, AppHeaderComponent, AppSidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './page.component.html',
})
export class ZardPageComponent implements AfterViewInit {
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
    { route: '/', label: 'Dashboard', labelKey: 'menu.dashboard', icon: 'monitor' },
    { route: '/contact/tenants', label: 'Tenants', labelKey: 'menu.tenants', icon: 'user' },
    { route: '/contact/owners', label: 'Owners', labelKey: 'menu.owners', icon: 'users' },
    { route: '/contact/services', label: 'Services', labelKey: 'menu.services', icon: 'building' },
    { route: '/property', label: 'Properties', labelKey: 'menu.properties', icon: 'house' },
    { route: '/building', label: 'Buildings', labelKey: 'menu.buildings', icon: 'building' },
    { route: '/leasing', label: 'Leasing', labelKey: 'menu.leasing', icon: 'file-text' },
    { route: '/reservation', label: 'Reservations', labelKey: 'menu.reservations', icon: 'calendar' },
    { route: '/keys', label: 'Keys', labelKey: 'menu.keys', icon: 'lock' },
    { route: '/bank', label: 'Banks', labelKey: 'menu.banks', icon: 'building-2' },
    { route: '/tasks', label: 'Tasks', labelKey: 'menu.tasks', icon: 'clipboard' },
    { route: '/maintenance', label: 'Maintenance', labelKey: 'menu.maintenance', icon: 'settings' },
    { route: '/ai-chat', label: 'AI Chat', labelKey: 'menu.aiChat', icon: 'sparkles' },
    { route: '/file-manager', label: 'File Manager', labelKey: 'menu.fileManager', icon: 'folder' },
    { route: '/settings', label: 'Settings', labelKey: 'menu.settings', icon: 'settings' },
  ]);
  readonly zUserName = input<string>('');
  readonly zUserEmail = input<string>('');
  readonly zUserAvatar = input<string | null>(null);
  readonly class = input<ClassValue>('');

  @ViewChild('sidebarRef', { static: false }) sidebarRef?: AppSidebarComponent;

  readonly sidebarCollapsed = computed(() => {
    return this.sidebarRef?.sidebarCollapsed() ?? false;
  });

  readonly sidebarToggle = (): void => {
    this.sidebarRef?.toggleSidebar();
  };

  ngAfterViewInit(): void {
    // Ensure ViewChild is available
  }

  onMobileMenuClick = (): void => {
    this.sidebarRef?.openMobileSidebar();
  };
}

