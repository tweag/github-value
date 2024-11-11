import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopilotSeatsComponent } from './copilot-seats.component';

describe('SeatsComponent', () => {
  let component: CopilotSeatsComponent;
  let fixture: ComponentFixture<CopilotSeatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotSeatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopilotSeatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
