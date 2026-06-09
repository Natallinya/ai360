import { HttpErrorResponse } from '@angular/common/http';

export function formatHttpError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Не удалось связаться с BFF (сеть или Render ещё просыпается). Подождите 30 с и повторите поиск.';
    }

    const body = err.error as { error?: string } | null;
    if (body?.error) {
      return body.error;
    }

    return `Ошибка сервера (${err.status}). Проверьте BFF: https://ai360.onrender.com/api/health`;
  }

  if (err instanceof Error) {
    if (err.name === 'TimeoutError' || err.message.includes('Timeout')) {
      return 'Сервер не ответил вовремя (Render мог заснуть). Подождите 10 с и попробуйте снова.';
    }

    return err.message;
  }

  return fallback;
}
