import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSecondComponent } from './workflow-second.component';

describe('WorkflowSecondComponent', () => {
  let component: WorkflowSecondComponent;
  let fixture: ComponentFixture<WorkflowSecondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowSecondComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowSecondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
