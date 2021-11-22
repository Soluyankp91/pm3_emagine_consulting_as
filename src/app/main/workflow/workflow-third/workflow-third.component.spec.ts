import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowThirdComponent } from './workflow-third.component';

describe('WorkflowThirdComponent', () => {
  let component: WorkflowThirdComponent;
  let fixture: ComponentFixture<WorkflowThirdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowThirdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowThirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
