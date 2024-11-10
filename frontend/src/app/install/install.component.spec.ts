import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallComponent } from './install.component';

describe('WelcomeComponent', () => {
  let component: InstallComponent;
  let fixture: ComponentFixture<InstallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
