import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from './shared/services/darkmode.service';
import { LanguageService } from './shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ZardToastComponent } from './shared/components/toast/toast.component';
import { ZardCommandDefaultComponent } from './shared/components/command/command-default.component';
import { CommandPaletteService } from './shared/services/command-palette.service';

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
  readonly commandPaletteService = inject(CommandPaletteService);
  title = 'admintemmplate';

  ngOnInit(): void {
    this.darkmodeService.initTheme();
    // Set TranslateService in LanguageService
    this.languageService.setTranslateService(this.translateService);
    // Initialize translation service with current language
    const currentLang = this.languageService.getCurrentLanguage();
    this.translateService.setDefaultLang('en');
    this.translateService.use(currentLang).subscribe();
  }
}
