import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopilotValueModelingComponent } from './copilot-value-modeling.component';

describe('CopilotValueModelingComponent', () => {
  let component: CopilotValueModelingComponent;
  let fixture: ComponentFixture<CopilotValueModelingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotValueModelingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopilotValueModelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
