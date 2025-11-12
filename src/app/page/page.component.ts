import { AfterViewInit, ChangeDetectionStrategy, Component, input, ViewChild, ViewEncapsulation } from '@angular/core';
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
    { route: '/settings', label: 'Settings', labelKey: 'menu.settings', icon: 'settings' },
  ]);
  readonly zUserName = input<string>('');
  readonly zUserEmail = input<string>('');
  readonly zUserAvatar = input<string | null>(null);
  readonly class = input<ClassValue>('');

  @ViewChild('sidebarRef', { static: false }) sidebarRef?: AppSidebarComponent;

  ngAfterViewInit(): void {
    // Ensure ViewChild is available
  }

  onMobileMenuClick = (): void => {
    this.sidebarRef?.openMobileSidebar();
  };
}

