import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowActionsDialogComponent } from './workflow-actions-dialog.component';

describe('WorkflowActionsDialogComponent', () => {
  let component: WorkflowActionsDialogComponent;
  let fixture: ComponentFixture<WorkflowActionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowActionsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowActionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
