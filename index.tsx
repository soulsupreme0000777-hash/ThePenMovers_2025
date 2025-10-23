import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

// A minimal polyfill for the 'process' object. This prevents a crash
// if 'process' is not defined, while allowing the execution environment
// to inject environment variables into `process.env`.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {};
}

import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient()
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.