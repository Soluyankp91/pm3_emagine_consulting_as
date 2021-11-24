import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryWorkflowComponent } from './primary-workflow.component';

describe('PrimaryWorkflowComponent', () => {
  let component: PrimaryWorkflowComponent;
  let fixture: ComponentFixture<PrimaryWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrimaryWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
