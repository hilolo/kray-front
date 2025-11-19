import { Component, inject, OnInit, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DarkModeService } from './shared/services/darkmode.service';
import { LanguageService } from './shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ZardToastComponent } from './shared/components/toast/toast.component';
import { ZardCommandDefaultComponent } from './shared/components/command/command-default.component';
import { CommandPaletteService } from './shared/services/command-palette.service';
import { ThemeService } from './shared/services/theme.service';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ZardToastComponent, ZardCommandDefaultComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
  private readonly themeService = inject(ThemeService); // Initialize theme service
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly commandPaletteService = inject(CommandPaletteService);
  title = 'admintemmplate';

  constructor() {
    // Watch for restricted company changes and redirect to locked page
    effect(() => {
      const company = this.userService.company();
      const isRestricted = company?.restricted === true;
      
      // Only redirect if restricted and not already on locked or login page
      if (isRestricted) {
        const currentUrl = this.router.url.split('?')[0]; // Remove query params
        if (currentUrl !== '/locked' && currentUrl !== '/login') {
          this.router.navigate(['/locked'], { replaceUrl: true });
        }
      }
    });
  }

  ngOnInit(): void {
    this.darkmodeService.initTheme();
    // Apply theme preset after dark mode is initialized
    // Use setTimeout to ensure DOM is ready and dark mode is applied first
    setTimeout(() => {
      this.themeService.applyCurrentTheme();
    }, 0);
    
    // Set TranslateService in LanguageService
    // Translations are already loaded via APP_INITIALIZER, so we just sync the service
    this.languageService.setTranslateService(this.translateService);
    
    // Ensure language is synced (translations are already loaded)
    const currentLang = this.languageService.getCurrentLanguage();
    if (this.translateService.currentLang !== currentLang) {
      this.translateService.use(currentLang).subscribe();
    }
  }
}
