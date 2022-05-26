import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowFinancesComponent } from './workflow-finances.component';

describe('WorkflowFinancesComponent', () => {
  let component: WorkflowFinancesComponent;
  let fixture: ComponentFixture<WorkflowFinancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowFinancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFinancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
