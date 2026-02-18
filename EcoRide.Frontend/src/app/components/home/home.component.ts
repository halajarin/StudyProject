import { Component, OnDestroy, AfterViewInit, ElementRef, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  template: `
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-shape hero-shape--1"></div>
        <div class="hero-shape hero-shape--2"></div>
        <div class="hero-shape hero-shape--3"></div>
        <div class="hero-particles">
          <span class="particle" *ngFor="let p of particles" [style.left]="p.x" [style.animationDelay]="p.delay" [style.animationDuration]="p.duration"></span>
        </div>
      </div>
      <div class="container hero-content">
        <img src="assets/ecoride-logo.svg" alt="EcoRide" class="hero-logo" />
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          {{ 'home.hero_badge' | translate }}
        </div>
        <h1 class="hero-title">
          {{ 'home.hero_title_line1' | translate }}
          <span class="gradient-text">{{ 'home.hero_title_highlight' | translate }}</span>
          {{ 'home.hero_title_line2' | translate }}
        </h1>
        <p class="hero-subtitle">{{ 'home.hero_subtitle' | translate }}</p>

        <div class="search-box">
          <form (ngSubmit)="searchTrip()" class="search-form">
            <div class="search-field">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
              </div>
              <input
                type="text"
                [(ngModel)]="searchForm.departureCity"
                name="departureCity"
                [placeholder]="'home.placeholder_departure' | translate">
              <label>{{ 'home.departure_city' | translate }}</label>
            </div>

            <div class="search-divider">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>

            <div class="search-field">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/></svg>
              </div>
              <input
                type="text"
                [(ngModel)]="searchForm.arrivalCity"
                name="arrivalCity"
                [placeholder]="'home.placeholder_arrival' | translate">
              <label>{{ 'home.arrival_city' | translate }}</label>
            </div>

            <div class="search-divider hide-mobile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>

            <div class="search-field">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <input
                type="date"
                [(ngModel)]="searchForm.departureDate"
                name="departureDate">
              <label>{{ showDateRange ? ('home.date_from' | translate) : ('home.date' | translate) }}</label>
            </div>

            <button type="button" class="date-toggle" (click)="toggleDateRange()">
              {{ showDateRange ? '&times;' : '+' }}
            </button>

            @if (showDateRange) {
              <div class="search-field">
                <div class="search-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <input
                  type="date"
                  [(ngModel)]="searchForm.departureDateTo"
                  name="departureDateTo">
                <label>{{ 'home.date_to' | translate }}</label>
              </div>
            }

            <button type="submit" class="search-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>{{ 'common.search' | translate }}</span>
            </button>
          </form>
        </div>

        <div class="hero-trust">
          <div class="trust-avatars">
            <div class="avatar" *ngFor="let a of avatarColors" [style.background]="a.bg">{{ a.letter }}</div>
          </div>
          <span>{{ 'home.hero_trust' | translate }}</span>
        </div>
      </div>
    </section>

    <!-- ===================== STATS BAR ===================== -->
    <section class="stats-bar" #reveal>
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="stat-number">2,500+</span>
            <span class="stat-label">{{ 'home.stat_users' | translate }}</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="stat-number">15,000+</span>
            <span class="stat-label">{{ 'home.stat_trips' | translate }}</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span class="stat-number">45 T</span>
            <span class="stat-label">{{ 'home.stat_co2' | translate }}</span>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span class="stat-number">4.8/5</span>
            <span class="stat-label">{{ 'home.stat_rating' | translate }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== HOW IT WORKS ===================== -->
    <section class="section how-it-works" #reveal>
      <div class="container">
        <div class="section-header">
          <span class="section-tag">{{ 'home.how_tag' | translate }}</span>
          <h2>{{ 'home.how_title' | translate }}</h2>
          <p class="section-desc">{{ 'home.how_subtitle' | translate }}</p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3>{{ 'home.step1_title' | translate }}</h3>
            <p>{{ 'home.step1_desc' | translate }}</p>
          </div>
          <div class="step-connector">
            <svg width="40" height="12" viewBox="0 0 40 12"><path d="M0 6h32M28 1l6 5-6 5" stroke="var(--primary-green)" stroke-width="2" fill="none"/></svg>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3>{{ 'home.step2_title' | translate }}</h3>
            <p>{{ 'home.step2_desc' | translate }}</p>
          </div>
          <div class="step-connector">
            <svg width="40" height="12" viewBox="0 0 40 12"><path d="M0 6h32M28 1l6 5-6 5" stroke="var(--primary-green)" stroke-width="2" fill="none"/></svg>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>{{ 'home.step3_title' | translate }}</h3>
            <p>{{ 'home.step3_desc' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FEATURES ===================== -->
    <section class="section features-section" #reveal>
      <div class="container">
        <div class="section-header">
          <span class="section-tag">{{ 'home.features_tag' | translate }}</span>
          <h2>{{ 'home.why_choose_title' | translate }}</h2>
          <p class="section-desc">{{ 'home.features_subtitle' | translate }}</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon feature-icon--eco">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18"/><path d="M17 8c3-1 7 2 7 2s-4 6-8 7"/><path d="M17 8c-4 4-6 8-6 12"/></svg>
            </div>
            <h3>{{ 'home.feature_eco_title' | translate }}</h3>
            <p>{{ 'home.feature_eco_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_eco_highlight' | translate }}
            </div>
          </div>

          <div class="feature-card featured">
            <div class="feature-popular">{{ 'home.feature_popular' | translate }}</div>
            <div class="feature-icon feature-icon--money">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            </div>
            <h3>{{ 'home.feature_economical_title' | translate }}</h3>
            <p>{{ 'home.feature_economical_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_economical_highlight' | translate }}
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon feature-icon--social">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>{{ 'home.feature_social_title' | translate }}</h3>
            <p>{{ 'home.feature_social_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_social_highlight' | translate }}
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon feature-icon--safe">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/></svg>
            </div>
            <h3>{{ 'home.feature_safe_title' | translate }}</h3>
            <p>{{ 'home.feature_safe_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_safe_highlight' | translate }}
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon feature-icon--electric">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>{{ 'home.feature_electric_title' | translate }}</h3>
            <p>{{ 'home.feature_electric_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_electric_highlight' | translate }}
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon feature-icon--flex">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>{{ 'home.feature_flex_title' | translate }}</h3>
            <p>{{ 'home.feature_flex_desc' | translate }}</p>
            <div class="feature-highlight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ 'home.feature_flex_highlight' | translate }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ECO IMPACT ===================== -->
    <section class="section eco-impact" #reveal>
      <div class="eco-bg">
        <div class="eco-shape eco-shape--1"></div>
        <div class="eco-shape eco-shape--2"></div>
      </div>
      <div class="container">
        <div class="eco-content">
          <div class="eco-text">
            <span class="section-tag section-tag--light">{{ 'home.eco_tag' | translate }}</span>
            <h2>{{ 'home.eco_title' | translate }}</h2>
            <p>{{ 'home.eco_description' | translate }}</p>
            <div class="eco-stats">
              <div class="eco-stat">
                <div class="eco-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18"/><path d="M17 8c3-1 7 2 7 2s-4 6-8 7"/><path d="M17 8c-4 4-6 8-6 12"/></svg>
                </div>
                <div>
                  <strong>-45%</strong>
                  <span>{{ 'home.eco_stat1' | translate }}</span>
                </div>
              </div>
              <div class="eco-stat">
                <div class="eco-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div>
                  <strong>30%</strong>
                  <span>{{ 'home.eco_stat2' | translate }}</span>
                </div>
              </div>
              <div class="eco-stat">
                <div class="eco-stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>{{ 'home.eco_stat3' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="eco-visual">
            <div class="eco-card-stack">
              <div class="eco-card eco-card--1">
                <div class="eco-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18"/><path d="M17 8c3-1 7 2 7 2s-4 6-8 7"/><path d="M17 8c-4 4-6 8-6 12"/></svg>
                </div>
                <span>{{ 'home.eco_card1' | translate }}</span>
              </div>
              <div class="eco-card eco-card--2">
                <div class="eco-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--dark-green)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                </div>
                <span>{{ 'home.eco_card2' | translate }}</span>
              </div>
              <div class="eco-card eco-card--3">
                <div class="eco-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <span>{{ 'home.eco_card3' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TESTIMONIALS ===================== -->
    <section class="section testimonials-section" #reveal>
      <div class="container">
        <div class="section-header">
          <span class="section-tag">{{ 'home.testimonials_tag' | translate }}</span>
          <h2>{{ 'home.testimonials_title' | translate }}</h2>
          <p class="section-desc">{{ 'home.testimonials_subtitle' | translate }}</p>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let t of testimonials; let i = index">
            <div class="testimonial-stars">
              <svg *ngFor="let s of [1,2,3,4,5]" width="18" height="18" viewBox="0 0 24 24" fill="#f39c12" stroke="#f39c12" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p class="testimonial-text">{{ 'home.testimonial' + (i + 1) + '_text' | translate }}</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar" [style.background]="t.color">{{ t.initials }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ 'home.testimonial' + (i + 1) + '_role' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CREDIT SYSTEM ===================== -->
    <section class="section credit-section" #reveal>
      <div class="container">
        <div class="credit-layout">
          <div class="credit-info">
            <span class="section-tag">{{ 'home.credit_tag' | translate }}</span>
            <h2>{{ 'home.credit_title' | translate }}</h2>
            <p>{{ 'home.credit_description' | translate }}</p>
            <div class="credit-steps">
              <div class="credit-step">
                <div class="credit-step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                </div>
                <div>
                  <strong>{{ 'home.credit_step1_title' | translate }}</strong>
                  <span>{{ 'home.credit_step1_desc' | translate }}</span>
                </div>
              </div>
              <div class="credit-step">
                <div class="credit-step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <strong>{{ 'home.credit_step2_title' | translate }}</strong>
                  <span>{{ 'home.credit_step2_desc' | translate }}</span>
                </div>
              </div>
              <div class="credit-step">
                <div class="credit-step-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <strong>{{ 'home.credit_step3_title' | translate }}</strong>
                  <span>{{ 'home.credit_step3_desc' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="credit-visual">
            <div class="credit-card-demo">
              <div class="credit-card-header">
                <span class="credit-card-logo">EcoRide</span>
                <span class="credit-card-badge">{{ 'home.credit_card_badge' | translate }}</span>
              </div>
              <div class="credit-card-amount">
                <span class="credit-card-number">20</span>
                <span class="credit-card-label">{{ 'common.credits' | translate }}</span>
              </div>
              <div class="credit-card-footer">
                {{ 'home.credit_card_footer' | translate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CTA ===================== -->
    <section class="section cta-section" *ngIf="!authService.isLoggedIn()" #reveal>
      <div class="container">
        <div class="cta-box">
          <div class="cta-bg-elements">
            <div class="cta-circle cta-circle--1"></div>
            <div class="cta-circle cta-circle--2"></div>
          </div>
          <h2>{{ 'home.cta_title' | translate }}</h2>
          <p>{{ 'home.cta_subtitle' | translate }}</p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn-cta btn-cta--primary">
              {{ 'home.cta_register' | translate }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a routerLink="/carpools" class="btn-cta btn-cta--outline">
              {{ 'home.cta_browse' | translate }}
            </a>
          </div>
          <p class="cta-bonus">{{ 'home.cta_bonus' | translate }}</p>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('reveal') revealElements!: QueryList<ElementRef>;

  authService = inject(AuthService);
  private router = inject(Router);
  private observer: IntersectionObserver | null = null;

  showDateRange = false;

  searchForm = {
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    departureDateTo: ''
  };

  particles = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100 + '%',
    delay: Math.random() * 8 + 's',
    duration: 8 + Math.random() * 12 + 's'
  }));

  avatarColors = [
    { bg: '#2ecc71', letter: 'S' },
    { bg: '#3498db', letter: 'M' },
    { bg: '#e74c3c', letter: 'A' },
    { bg: '#f39c12', letter: 'L' },
    { bg: '#9b59b6', letter: 'J' },
  ];

  testimonials = [
    { name: 'Sophie Martin', initials: 'SM', color: '#2ecc71' },
    { name: 'Lucas Dupont', initials: 'LD', color: '#3498db' },
    { name: 'Emma Bernard', initials: 'EB', color: '#9b59b6' },
  ];

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    setTimeout(() => {
      this.revealElements.forEach(el => {
        el.nativeElement.classList.add('reveal-section');
        this.observer?.observe(el.nativeElement);
      });
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  toggleDateRange() {
    this.showDateRange = !this.showDateRange;
    if (!this.showDateRange) {
      this.searchForm.departureDateTo = '';
    }
  }

  searchTrip() {
    const params: any = {};
    if (this.searchForm.departureCity) params.departureCity = this.searchForm.departureCity;
    if (this.searchForm.arrivalCity) params.arrivalCity = this.searchForm.arrivalCity;
    if (this.searchForm.departureDate) params.departureDate = this.searchForm.departureDate;
    if (this.searchForm.departureDateTo) params.departureDateTo = this.searchForm.departureDateTo;

    this.router.navigate(['/carpools'], { queryParams: params });
  }
}
