import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSalesComponent } from './workflow-sales.component';

describe('WorkflowSalesComponent', () => {
  let component: WorkflowSalesComponent;
  let fixture: ComponentFixture<WorkflowSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowSalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
