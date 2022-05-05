import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkflowDialogComponent } from './create-workflow-dialog.component';

describe('CreateWorkflowDialogComponent', () => {
  let component: CreateWorkflowDialogComponent;
  let fixture: ComponentFixture<CreateWorkflowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWorkflowDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWorkflowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
