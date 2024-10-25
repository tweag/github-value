import { TestBed } from '@angular/core/testing';
import { SettingsHttpService } from '../services/settings.service';

describe('SettingsService', () => {
  let service: SettingsHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
