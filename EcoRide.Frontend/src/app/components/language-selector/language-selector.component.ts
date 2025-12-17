import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-selector">
      <button
        *ngFor="let lang of languages"
        [class.active]="lang === currentLanguage"
        (click)="changeLanguage(lang)"
        [title]="getLanguageName(lang)"
        class="language-button">
        {{ lang.toUpperCase() }}
      </button>
    </div>
  `,
  styles: [`
    .language-selector {
      display: flex;
      gap: 0.5rem;
    }

    .language-button {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .language-button:hover {
      background: #f5f5f5;
      border-color: #4CAF50;
    }

    .language-button.active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
    }
  `]
})
export class LanguageSelectorComponent {
  languages: string[];
  currentLanguage: string;

  constructor(private translationService: TranslationService) {
    this.languages = this.translationService.getSupportedLanguages();
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  changeLanguage(language: string): void {
    this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }

  getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      'en': 'English',
      'fr': 'Français'
    };
    return names[code] || code;
  }
}
