import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopilotCalculatorComponent } from './copilot-calculator.component';

describe('CalculatorComponent', () => {
  let component: CopilotCalculatorComponent;
  let fixture: ComponentFixture<CopilotCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopilotCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
