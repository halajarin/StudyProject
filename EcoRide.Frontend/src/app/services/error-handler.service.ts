import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private translate: TranslateService) {}

  /**
   * Handles HTTP errors and returns a user-friendly error message
   * @param err The error object from HTTP response
   * @param defaultKey Translation key for default error message
   * @returns Error message string
   */
  handleError(err: any, defaultKey: string = 'messages.error_occurred'): string {
    return err.error?.message || this.translate.instant(defaultKey);
  }

  /**
   * Handles HTTP errors and updates an error signal
   * @param err The error object from HTTP response
   * @param errorSignal The signal to update with error message
   * @param defaultKey Translation key for default error message
   */
  handleErrorWithSignal(err: any, errorSignal: any, defaultKey: string = 'messages.error_occurred'): void {
    const message = this.handleError(err, defaultKey);
    errorSignal.set(message);
  }

  /**
   * Handles HTTP errors, updates error signal and loading signal
   * @param err The error object from HTTP response
   * @param errorSignal The signal to update with error message
   * @param loadingSignal The loading signal to set to false
   * @param defaultKey Translation key for default error message
   */
  handleErrorWithLoadingSignal(
    err: any,
    errorSignal: any,
    loadingSignal: any,
    defaultKey: string = 'messages.error_occurred'
  ): void {
    const message = this.handleError(err, defaultKey);
    errorSignal.set(message);
    loadingSignal.set(false);
  }
}
