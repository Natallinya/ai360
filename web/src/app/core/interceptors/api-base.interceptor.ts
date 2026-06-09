import { HttpInterceptorFn } from '@angular/common/http';

import { apiUrl } from '../utils/api-url';

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    return next(req.clone({ url: apiUrl(req.url) }));
  }

  return next(req);
};
