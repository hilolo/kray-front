import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';

@Component({
  selector: 'z-navbar',
  exportAs: 'zNavbar',
  standalone: true,
  imports: [ZardButtonComponent, ZardIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flex items-center justify-between h-full px-4 w-full">
      <div class="flex items-center gap-2">
        <ng-content select="[navbar-brand]"></ng-content>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Language Toggle -->
        <div class="flex items-center gap-1 border rounded-md">
          <z-button
            (click)="setLanguage('en')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'en'"
            class="rounded-r-none"
          >
            EN
          </z-button>
          <z-button
            (click)="setLanguage('fr')"
            zType="ghost"
            zSize="sm"
            [class.bg-accent]="currentLanguage() === 'fr'"
            class="rounded-l-none border-l"
          >
            FR
          </z-button>
        </div>

        <!-- Dark Mode Toggle -->
        <z-button
          (click)="toggleTheme()"
          zType="ghost"
          zSize="icon"
          [attr.aria-label]="getCurrentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (getCurrentTheme() === 'dark') {
            <z-icon zType="sun" />
          } @else {
            <z-icon zType="moon" />
          }
        </z-button>
      </div>
    </div>
  `,
})
export class ZardNavbarComponent {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.darkmodeService.getCurrentTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }
}

