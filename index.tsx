import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

// A more robust polyfill for the 'process' object. This prevents crashes
// if 'process' or 'process.env' is not defined, improving compatibility
// with libraries that might expect them.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {}
  };
}

import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient()
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.