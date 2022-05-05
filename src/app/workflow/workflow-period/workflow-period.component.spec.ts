import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPeriodComponent } from './workflow-period.component';

describe('WorkflowPeriodComponent', () => {
  let component: WorkflowPeriodComponent;
  let fixture: ComponentFixture<WorkflowPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
