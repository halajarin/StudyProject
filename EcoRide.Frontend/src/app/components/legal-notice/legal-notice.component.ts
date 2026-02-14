import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="container">
      <div class="legal-page">
        <h1>{{ 'legal.title' | translate }}</h1>

        <section>
          <h2>{{ 'legal.editor_title' | translate }}</h2>
          <p>{{ 'legal.editor_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.hosting_title' | translate }}</h2>
          <p>{{ 'legal.hosting_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.intellectual_property_title' | translate }}</h2>
          <p>{{ 'legal.intellectual_property_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.data_protection_title' | translate }}</h2>
          <p>{{ 'legal.data_protection_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.cookies_title' | translate }}</h2>
          <p>{{ 'legal.cookies_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.liability_title' | translate }}</h2>
          <p>{{ 'legal.liability_content' | translate }}</p>
        </section>

        <section>
          <h2>{{ 'legal.contact_title' | translate }}</h2>
          <p>{{ 'legal.contact_content' | translate }}</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--light-green);
    }

    section {
      margin-bottom: 2rem;
    }

    section h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    section p {
      color: var(--gray);
      line-height: 1.7;
    }
  `]
})
export class LegalNoticeComponent {}
