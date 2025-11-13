import type { ClassValue } from 'clsx';

import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { mergeClasses } from '@shared/utils/merge-classes';
import { contentVariants } from './layout.variants';
import { ZardBreadcrumbModule } from '../breadcrumb/breadcrumb.module';
import { ZardIconComponent } from '../icon/icon.component';
import type { ZardIcon } from '../icon/icons';

interface BreadcrumbItem {
  label: string;
  labelKey?: string;
  route: string;
  isLast: boolean;
}

@Component({
  selector: 'z-content',
  exportAs: 'zContent',
  standalone: true,
  imports: [
    TranslateModule,
    ZardBreadcrumbModule,
    ZardIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <main>
      @if (breadcrumbs().length > 0) {
        <div class="mb-6 flex items-center gap-2">
          @if (zSidebarToggle()) {
            <div
              [class]="triggerClasses()"
              (click)="onToggleSidebar()"
              (keydown.enter)="onToggleSidebar(); $event.preventDefault()"
              (keydown.space)="onToggleSidebar(); $event.preventDefault()"
              tabindex="0"
              role="button"
              [attr.aria-label]="zSidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
              [attr.aria-expanded]="!zSidebarCollapsed()"
            >
              <z-icon [zType]="menuIcon()" />
            </div>
          }
          <z-breadcrumb>
            <z-breadcrumb-list>
              @for (crumb of breadcrumbs(); track crumb.route; let i = $index) {
                <z-breadcrumb-item>
                  @if (crumb.isLast) {
                    <z-breadcrumb-page>
                      {{ crumb.labelKey ? (crumb.labelKey | translate) : crumb.label }}
                    </z-breadcrumb-page>
                  } @else {
                    <z-breadcrumb-link [zLink]="crumb.route">
                      {{ crumb.labelKey ? (crumb.labelKey | translate) : crumb.label }}
                    </z-breadcrumb-link>
                  }
                </z-breadcrumb-item>
                @if (!crumb.isLast) {
                  <z-breadcrumb-separator />
                }
              }
            </z-breadcrumb-list>
          </z-breadcrumb>
        </div>
      }
      <ng-content></ng-content>
    </main>
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class ContentComponent {
  private readonly router = inject(Router);

  readonly class = input<ClassValue>('');
  readonly zSidebarToggle = input<(() => void) | null>(null);
  readonly zSidebarCollapsed = input<boolean>(false);

  protected readonly classes = computed(() => mergeClasses(contentVariants(), this.class()));

  protected readonly triggerClasses = computed(() => 
    mergeClasses(
      'flex items-center justify-center cursor-pointer rounded-sm border border-sidebar-border bg-sidebar hover:bg-sidebar-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 w-6 h-6 shrink-0'
    )
  );

  protected readonly menuIcon = computed((): ZardIcon => {
    return 'panel-left';
  });

  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    // Initialize breadcrumbs
    this.updateBreadcrumbs(this.router.url);

    // Update breadcrumbs on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateBreadcrumbs(event.urlAfterRedirects);
        }
      });
  }

  private updateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter((segment) => segment !== '');
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Always add home as first breadcrumb
    breadcrumbItems.push({
      label: 'Home',
      labelKey: 'breadcrumb.home',
      route: '/',
      isLast: segments.length === 0,
    });

    // Build breadcrumbs from route segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Map route segments to labels
      let label = this.formatSegmentLabel(segment);
      let labelKey: string | undefined;

      // Use translation keys for known routes
      if (segment === 'settings') {
        labelKey = 'menu.settings';
        label = 'Settings';
      } else if (segment === 'dashboard' || (segment === '' && index === 0)) {
        labelKey = 'menu.dashboard';
        label = 'Dashboard';
      }

      breadcrumbItems.push({
        label,
        labelKey,
        route: currentPath,
        isLast,
      });
    });

    this.breadcrumbs.set(breadcrumbItems);
  }

  private formatSegmentLabel(segment: string): string {
    // Convert kebab-case or snake_case to Title Case
    return segment
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  protected onToggleSidebar(): void {
    const toggleFn = this.zSidebarToggle();
    if (toggleFn) {
      toggleFn();
    }
  }
}