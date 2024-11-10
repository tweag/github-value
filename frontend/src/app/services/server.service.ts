import { isDevMode } from '@angular/core';

export const serverUrl = (() => {
  if (process.env['BASE_URL']) {
    return process.env['BASE_URL'];
  } else if (isDevMode()) {
    return 'http://localhost';
  } else {
    return 'http://localhost';
  }
})();

