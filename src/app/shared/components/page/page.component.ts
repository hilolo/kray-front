import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '../layout/layout.module';
import { ZardNavbarComponent } from '../navbar/navbar.component';
import { ZardIconComponent } from '../icon/icon.component';
import type { ZardIcon } from '../icon/icons';

@Component({
  selector: 'z-page',
  exportAs: 'zPage',
  standalone: true,
  imports: [LayoutModule, ZardNavbarComponent, ZardIconComponent, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <z-layout class="h-screen" zDirection="vertical">
      <z-header>
        <z-navbar>
          <div navbar-brand>
            <h1 class="text-xl font-semibold">{{ zTitle() }}</h1>
          </div>
        </z-navbar>
      </z-header>

      <z-layout class="flex-1 min-h-0" zDirection="horizontal">
        <z-sidebar [zWidth]="zSidebarWidth()">
          <z-sidebar-group>
            <nav class="flex flex-col gap-1">
              @for (item of zSidebarItems(); track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-accent"
                  class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  @if (item.icon) {
                    <z-icon [zType]="item.icon" />
                  }
                  <span>{{ item.label }}</span>
                </a>
              }
            </nav>
          </z-sidebar-group>
        </z-sidebar>

        <z-content>
          <ng-content></ng-content>
        </z-content>
      </z-layout>

      <z-footer [zHeight]="zFooterHeight()">
        <div class="flex items-center justify-center h-full text-xs text-muted-foreground">
          <ng-content select="[footer-content]"></ng-content>
        </div>
      </z-footer>
    </z-layout>
  `,
})
export class ZardPageComponent {
  readonly zTitle = input<string>('Dashboard');
  readonly zSidebarWidth = input<number>(240);
  readonly zFooterHeight = input<number>(32);
  readonly zSidebarItems = input<
    Array<{
      route: string;
      label: string;
      icon?: ZardIcon;
    }>
  >([
    { route: '/', label: 'Dashboard', icon: 'layout-dashboard' },
    { route: '/settings', label: 'Settings', icon: 'settings' },
  ]);
  readonly class = input<ClassValue>('');
}

