import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedRequest = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Authorization: 'Client-ID ' + environment.accessKey,
      'Cache-Control': 'max-age=31536000'
    }
  });
  return next(modifiedRequest);
};
