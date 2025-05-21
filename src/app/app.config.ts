import { ApplicationConfig, provideZoneChangeDetection, SecurityContext } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CLIPBOARD_OPTIONS, ClipboardButtonComponent, MERMAID_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { authInterceptor } from './services/auth-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideMarkdown({
      loader: HttpClient,
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: { buttonComponent: ClipboardButtonComponent },
      },
      mermaidOptions: {
        provide: MERMAID_OPTIONS,
        useValue: {
          darkMode: true,
          look: 'handDrawn',
        },
      },
      sanitize: SecurityContext.NONE,
    }),
  ]
};


