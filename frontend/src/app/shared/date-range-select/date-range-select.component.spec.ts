import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeSelectComponent } from './date-range-select.component';

describe('DateRangeSelectComponent', () => {
  let component: DateRangeSelectComponent;
  let fixture: ComponentFixture<DateRangeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateRangeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
