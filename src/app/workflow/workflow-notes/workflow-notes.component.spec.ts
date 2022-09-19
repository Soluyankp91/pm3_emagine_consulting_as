import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowNotesComponent } from './workflow-notes.component';

describe('WorkflowNotesComponent', () => {
  let component: WorkflowNotesComponent;
  let fixture: ComponentFixture<WorkflowNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
