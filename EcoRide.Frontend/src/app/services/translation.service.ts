import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'user_language';
  private readonly DEFAULT_LANGUAGE = 'en';
  private readonly SUPPORTED_LANGUAGES = ['en', 'fr'];

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set supported languages
    this.translate.addLangs(this.SUPPORTED_LANGUAGES);
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

    // Determine which language to use
    const language = this.getPreferredLanguage();
    this.setLanguage(language);
  }

  private getPreferredLanguage(): string {
    // 1. Check local storage
    const storedLang = localStorage.getItem(this.STORAGE_KEY);
    if (storedLang && this.SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }

    // 2. Check browser language
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && this.SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }

    // 3. Use default language
    return this.DEFAULT_LANGUAGE;
  }

  setLanguage(language: string): void {
    if (this.SUPPORTED_LANGUAGES.includes(language)) {
      this.translate.use(language);
      localStorage.setItem(this.STORAGE_KEY, language);
      // Set HTML lang attribute for accessibility
      document.documentElement.lang = language;
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANGUAGE;
  }

  getSupportedLanguages(): string[] {
    return this.SUPPORTED_LANGUAGES;
  }

  translate(key: string, params?: Object): string {
    return this.translate.instant(key, params);
  }
}
