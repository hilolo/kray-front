import type { ClassValue } from 'clsx';

import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { mergeClasses } from '@shared/utils/merge-classes';
import { contentVariants } from './layout.variants';
import { ZardBreadcrumbModule } from '../breadcrumb/breadcrumb.module';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <main class="flex flex-col min-h-0 flex-1">
      @if (zShowBreadcrumb() && breadcrumbs().length > 0) {
        <div class="mb-6 flex items-center gap-2">
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
  readonly zShowBreadcrumb = input<boolean>(true);

  protected readonly classes = computed(() => mergeClasses(contentVariants(), this.class()));

  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    // Initialize breadcrumbs (without query params)
    const urlWithoutQuery = this.router.url.split('?')[0];
    this.updateBreadcrumbs(urlWithoutQuery);

    // Update breadcrumbs on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Remove query parameters from URL for breadcrumb display
          const urlWithoutQuery = event.urlAfterRedirects.split('?')[0];
          this.updateBreadcrumbs(urlWithoutQuery);
        }
      });
  }

  private updateBreadcrumbs(url: string): void {
    // Remove query parameters from URL for breadcrumb display
    const urlWithoutQuery = url.split('?')[0];
    const segments = urlWithoutQuery.split('/').filter((segment) => segment !== '');
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
}