import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: TranslateService, useValue: translateSpy }
      ]
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('should return translated server error when translation exists', () => {
      const err = { error: { message: 'Insufficient credits' } };
      translateSpy.instant.and.callFake((key: string) => {
        if (key === 'server_errors.Insufficient credits') return 'Crédits insuffisants';
        return key;
      });

      const result = service.handleError(err);

      expect(result).toBe('Crédits insuffisants');
    });

    it('should return original message when no translation exists', () => {
      const err = { error: { message: 'Unknown server error' } };
      translateSpy.instant.and.callFake((key: string) => key);

      const result = service.handleError(err);

      expect(result).toBe('Unknown server error');
    });

    it('should return default translated message when no error message provided', () => {
      const err = { error: {} };
      translateSpy.instant.and.callFake((key: string) => {
        if (key === 'messages.error_occurred') return 'An error occurred';
        return key;
      });

      const result = service.handleError(err);

      expect(result).toBe('An error occurred');
    });

    it('should return default message when error object is null', () => {
      const err = { error: null };
      translateSpy.instant.and.callFake((key: string) => {
        if (key === 'messages.error_occurred') return 'An error occurred';
        return key;
      });

      const result = service.handleError(err);

      expect(result).toBe('An error occurred');
    });

    it('should use custom default key', () => {
      const err = { error: {} };
      translateSpy.instant.and.callFake((key: string) => {
        if (key === 'custom.error') return 'Custom error message';
        return key;
      });

      const result = service.handleError(err, 'custom.error');

      expect(result).toBe('Custom error message');
    });
  });

  describe('handleErrorWithSignal', () => {
    it('should set error signal with translated message', () => {
      const errorSignal = signal('');
      const err = { error: { message: 'Carpool not found' } };
      translateSpy.instant.and.callFake((key: string) => {
        if (key === 'server_errors.Carpool not found') return 'Covoiturage introuvable';
        return key;
      });

      service.handleErrorWithSignal(err, errorSignal);

      expect(errorSignal()).toBe('Covoiturage introuvable');
    });
  });

  describe('handleErrorWithLoadingSignal', () => {
    it('should set error signal and reset loading signal to false', () => {
      const errorSignal = signal('');
      const loadingSignal = signal(true);
      const err = { error: { message: 'Not found' } };
      translateSpy.instant.and.callFake((key: string) => key);

      service.handleErrorWithLoadingSignal(err, errorSignal, loadingSignal);

      expect(errorSignal()).toBe('Not found');
      expect(loadingSignal()).toBe(false);
    });
  });
});
