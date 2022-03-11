import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSourcingComponent } from './workflow-sourcing.component';

describe('WorkflowSourcingComponent', () => {
  let component: WorkflowSourcingComponent;
  let fixture: ComponentFixture<WorkflowSourcingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowSourcingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowSourcingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
