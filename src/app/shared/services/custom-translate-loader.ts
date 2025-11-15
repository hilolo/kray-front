import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, tap, catchError } from 'rxjs';
import { of } from 'rxjs';

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const url = `/assets/i18n/${lang}.json`;
    console.log('[CustomTranslateLoader] Loading translations from:', url);
    const startTime = Date.now();
    
    return this.http.get(url).pipe(
      tap((translations) => {
        const loadTime = Date.now() - startTime;
        console.log('[CustomTranslateLoader] ✅ Translations loaded from', url, 'in', loadTime + 'ms');
        console.log('[CustomTranslateLoader] Translation keys count:', translations ? Object.keys(translations).length : 0);
        if (translations) {
          const sampleKeys = Object.keys(translations).slice(0, 5);
          console.log('[CustomTranslateLoader] Sample translation keys:', sampleKeys);
        }
      }),
      catchError((error) => {
        const loadTime = Date.now() - startTime;
        console.error('[CustomTranslateLoader] ❌ Error loading translations from', url, 'after', loadTime + 'ms:', error);
        return of({});
      })
    );
  }
}

