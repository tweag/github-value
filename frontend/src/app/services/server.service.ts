import { isDevMode } from '@angular/core';

export const serverUrl = (() => {
  if (isDevMode()) {
    return 'http://localhost:80';
  } else {
    return '';
  }
})();

