import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from './shared/services/darkmode.service';
import { LanguageService } from './shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
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
