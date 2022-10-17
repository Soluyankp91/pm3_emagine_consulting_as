import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantInformationComponent } from './consultant-information.component';

describe('ConsultantInformationComponent', () => {
  let component: ConsultantInformationComponent;
  let fixture: ComponentFixture<ConsultantInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultantInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultantInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
