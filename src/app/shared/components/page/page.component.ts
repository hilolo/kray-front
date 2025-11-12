import { ChangeDetectionStrategy, Component, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '../layout/layout.module';
import { ZardIconComponent } from '../icon/icon.component';
import { ZardButtonComponent } from '../button/button.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardDropdownModule } from '../dropdown/dropdown.module';
import type { ZardIcon } from '../icon/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'z-page',
  exportAs: 'zPage',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardButtonComponent, ZardDropdownModule, RouterLink, RouterLinkActive, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <z-layout class="h-screen" zDirection="vertical">
      <z-header>
        <div class="flex items-center justify-between h-full w-full">
          <!-- Logo Section - Left -->
          <div class="flex items-center gap-2 flex-shrink-0">
            @if (!logoError()) {
              <img 
                [src]="currentTheme() === 'dark' ? '/assets/logo-white.svg' : '/assets/logo.svg'" 
                alt="Logo" 
                class="h-8 w-auto"
                (error)="logoError.set(true)"
              />
            } @else {
              <span class="text-lg font-bold">Logo</span>
            }
          </div>
          
          <!-- Controls Section - Right -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <!-- Language Dropdown -->
            <z-dropdown-menu>
              <z-button
                dropdown-trigger
                zType="ghost"
                zSize="sm"
              >
                {{ currentLanguage() === 'en' ? 'EN' : 'FR' }}
              </z-button>
              
              <z-dropdown-menu-item (click)="setLanguage('en')" [class.bg-accent]="currentLanguage() === 'en'">
                {{ 'language.english' | translate }}
              </z-dropdown-menu-item>
              <z-dropdown-menu-item (click)="setLanguage('fr')" [class.bg-accent]="currentLanguage() === 'fr'">
                {{ 'language.french' | translate }}
              </z-dropdown-menu-item>
            </z-dropdown-menu>

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
          </div>
        </div>
      </z-header>

      <z-layout class="flex-1 min-h-0" zDirection="horizontal">
        <z-sidebar 
          [zWidth]="zSidebarWidth()" 
          [zCollapsible]="true"
          [zCollapsed]="sidebarCollapsed()"
          [zCollapsedWidth]="64"
          (zCollapsedChange)="sidebarCollapsed.set($event)"
          [class]="sidebarCollapsed() ? 'p-2' : 'p-6'"
        >
          <z-sidebar-group>
            <nav class="flex flex-col gap-1">
              @for (item of zSidebarItems(); track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-accent"
                  [class]="sidebarCollapsed() ? 'justify-center px-2' : 'gap-3 px-3'"
                  class="flex items-center py-2 rounded-md hover:bg-accent transition-colors"
                  [attr.title]="sidebarCollapsed() ? (item.labelKey ? (item.labelKey | translate) : item.label) : null"
                >
                  @if (item.icon) {
                    <z-icon [zType]="item.icon" />
                  }
                  @if (!sidebarCollapsed()) {
                    <span>{{ item.labelKey ? (item.labelKey | translate) : item.label }}</span>
                  }
                </a>
              }
            </nav>
          </z-sidebar-group>


        </z-sidebar>

        <z-content class="!min-h-0">
          <ng-content></ng-content>
        </z-content>
      </z-layout>
    </z-layout>
  `,
})
export class ZardPageComponent {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);

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
    { route: '/', label: 'Dashboard', labelKey: 'menu.dashboard', icon: 'layout-dashboard' },
    { route: '/settings', label: 'Settings', labelKey: 'menu.settings', icon: 'settings' },
  ]);
  readonly class = input<ClassValue>('');

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly logoError = signal(false);
  readonly sidebarCollapsed = signal(false);

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }
}

