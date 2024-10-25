import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { SetupGuard } from './setup.guard';

describe('setupGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => setupGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
