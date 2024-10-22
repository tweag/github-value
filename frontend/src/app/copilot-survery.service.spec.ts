import { TestBed } from '@angular/core/testing';

import { CopilotSurveryService } from './copilot-survery.service';

describe('CopilotSurveryService', () => {
  let service: CopilotSurveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopilotSurveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
