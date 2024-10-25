import { isDevMode } from '@angular/core';

export const serverUrl = isDevMode() ? 'http://localhost' : '';
