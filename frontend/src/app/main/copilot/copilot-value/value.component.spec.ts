import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopilotValueComponent } from './value.component';

describe('CopilotDashboardComponent', () => {
  let component: CopilotValueComponent;
  let fixture: ComponentFixture<CopilotValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopilotValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
