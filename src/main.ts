import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { headersInterceptor } from './app/core/services/headers.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]),
    provideHttpClient(withInterceptors([headersInterceptor]))
  ]
}).catch(err => console.error(err));
