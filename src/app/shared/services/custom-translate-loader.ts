import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError } from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    let url = `/assets/i18n/${lang}.json`;
    
    // Add cache-busting in development to prevent browser caching
    if (!environment.production) {
      const timestamp = new Date().getTime();
      url += `?v=${timestamp}`;
    }
    
    // Set headers to prevent caching
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return this.http.get(url, { headers }).pipe(
      catchError(() => {
        return of({});
      })
    );
  }
}

