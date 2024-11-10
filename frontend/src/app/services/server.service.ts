import { isDevMode } from '@angular/core';

export const serverUrl = isDevMode() ? 'http://172.21.80.1' : '';
