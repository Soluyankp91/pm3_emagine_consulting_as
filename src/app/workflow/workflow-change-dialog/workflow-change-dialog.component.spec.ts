import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowChangeDialogComponent } from './workflow-change-dialog.component';

describe('WorkflowChangeDialogComponent', () => {
  let component: WorkflowChangeDialogComponent;
  let fixture: ComponentFixture<WorkflowChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowChangeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
