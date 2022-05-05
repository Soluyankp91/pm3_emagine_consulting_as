import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowConsultantActionsDialogComponent } from './workflow-consultant-actions-dialog.component';

describe('WorkflowConsultantActionsDialogComponent', () => {
  let component: WorkflowConsultantActionsDialogComponent;
  let fixture: ComponentFixture<WorkflowConsultantActionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowConsultantActionsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowConsultantActionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
