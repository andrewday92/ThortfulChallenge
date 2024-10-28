import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const modifiedRequest = request.clone({
      setHeaders:{
          ContentType: 'application/json',
          Authorization: 'Client-ID ' + environment.accessKey,
          'Cache-Control': 'max-age=31536000',
          'Content-Encoding': 'br'
      }
    })
    return next.handle(modifiedRequest);
  }
}
