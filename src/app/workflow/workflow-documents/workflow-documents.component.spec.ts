import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDocumentsComponent } from './workflow-documents.component';

describe('WorkflowDocumentsComponent', () => {
  let component: WorkflowDocumentsComponent;
  let fixture: ComponentFixture<WorkflowDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
