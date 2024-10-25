import { TestBed } from '@angular/core/testing';
import { CopilotSurveyService } from '../services/copilot-survery.service';

describe('CopilotSurveryService', () => {
  let service: CopilotSurveyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopilotSurveyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
