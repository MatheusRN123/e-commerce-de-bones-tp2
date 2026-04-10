import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePt);

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
}).catch((err) => console.error(err));