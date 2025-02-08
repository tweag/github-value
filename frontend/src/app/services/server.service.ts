import { isDevMode } from '@angular/core';

export const serverUrl = (() => {
  if (isDevMode()) {
    return 'http://localhost:8080';
  } else {
    return '';
  }
})();

