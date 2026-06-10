import { HttpErrorResponse } from '@angular/common/http';

import { formatHttpError } from './http-error-message';

describe('formatHttpError', () => {
  it('maps network error', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(formatHttpError(err, 'fallback')).toContain('BFF');
  });

  it('uses server error body', () => {
    const err = new HttpErrorResponse({ status: 422, error: { error: 'Неверный URL' } });
    expect(formatHttpError(err, 'fallback')).toBe('Неверный URL');
  });

  it('maps timeout errors', () => {
    expect(formatHttpError(new Error('Timeout has occurred'), 'fallback')).toContain('не ответил');
  });

  it('returns fallback for unknown', () => {
    expect(formatHttpError({}, 'Что-то пошло не так')).toBe('Что-то пошло не так');
  });
});
